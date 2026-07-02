window.mouseX = 0;
window.mouseY = 0;
let cachedBlocks = null;
let targetedConnection = null;
const SMART_SEARCH = {

    // Movement
    movement: [
        "motion_movesteps",
        "motion_movegrids",
        "motion_changexby",
        "motion_changeyby",
        "motion_gotoxy",
        "motion_glidesecstoxy",
        "motion_goto",
        "motion_glideto"
    ],

    move: [
        "motion_movesteps",
        "motion_movegrids",
        "motion_changexby",
        "motion_changeyby"
    ],

    wasd: [
        "event_whenkeypressed",
        "sensing_keypressed",
        "motion_changexby",
        "motion_changeyby"
    ],

    keyboard: [
        "event_whenkeypressed",
        "sensing_keypressed"
    ],

    // Loops
    loop: [
        "control_repeat",
        "control_repeat_until",
        "control_forever"
    ],

    repeat: [
        "control_repeat",
        "control_repeat_until",
        "control_forever"
    ],

    // Conditions
    condition: [
        "control_if",
        "control_if_else",
        "operator_gt",
        "operator_lt",
        "operator_equals"
    ],

    if: [
        "control_if",
        "control_if_else"
    ],

    // Math
    math: [
        "operator_add",
        "operator_subtract",
        "operator_multiply",
        "operator_divide",
        "operator_mod",
        "operator_round",
        "operator_mathop",
        "operator_random"
    ],

    add: ["operator_add"],
    plus: ["operator_add"],
    sum: ["operator_add"],

    subtract: ["operator_subtract"],
    minus: ["operator_subtract"],

    multiply: ["operator_multiply"],
    times: ["operator_multiply"],

    divide: ["operator_divide"],

    random: ["operator_random"],

    // Logic
    logic: [
        "operator_and",
        "operator_or",
        "operator_not",
        "operator_gt",
        "operator_lt",
        "operator_equals"
    ],

    // Variables
    variable: [
        "data_variable",
        "data_setvariableto",
        "data_changevariableby",
        "data_showvariable",
        "data_hidevariable"
    ],

    score: [
        "data_variable",
        "data_setvariableto",
        "data_changevariableby"
    ],

    // Events
    event: [
        "event_whenflagclicked",
        "event_whenkeypressed",
        "event_whenbroadcastreceived",
        "event_broadcast",
        "event_broadcastandwait"
    ],

    message: [
        "event_broadcast",
        "event_broadcastandwait"
    ],

    broadcast: [
        "event_broadcast",
        "event_broadcastandwait"
    ],

    // Clones
    clone: [
        "control_start_as_clone",
        "control_create_clone_of",
        "control_delete_this_clone"
    ],

    enemy: [
        "control_create_clone_of",
        "control_delete_this_clone",
        "sensing_touchingobject"
    ],

    // Sensing
    touch: [
        "sensing_touchingobject",
        "sensing_touchingcolor",
        "sensing_coloristouchingcolor"
    ],

    collision: [
        "sensing_touchingobject",
        "sensing_touchingcolor"
    ],

    mouse: [
        "sensing_mousex",
        "sensing_mousey",
        "sensing_mousedown"
    ],

    timer: [
        "sensing_timer",
        "sensing_resettimer"
    ],

    // Looks
    appearance: [
        "looks_show",
        "looks_hide",
        "looks_switchcostumeto",
        "looks_nextcostume"
    ],

    costume: [
        "looks_switchcostumeto",
        "looks_nextcostume"
    ],

    show: ["looks_show"],
    hide: ["looks_hide"],

    say: [
        "looks_say",
        "looks_sayforsecs"
    ],

    think: [
        "looks_think",
        "looks_thinkforsecs"
    ],

    // Sound
    sound: [
        "sound_play",
        "sound_playuntildone",
        "sound_stopallsounds"
    ],

    music: [
        "sound_play",
        "sound_playuntildone"
    ]
};
const SEARCH_SYNONYMS = {

    wasd: ["wasd","player","movement","controls"],
    math: ["math","calculate","arithmetic","number"],
    loop: ["loop","repeat","iterate","cycle"],
    condition: ["condition","if","branch","decision"],
    variable: ["variable","score","counter","value"],
    message: ["message","broadcast","signal"],
    clone: ["clone","duplicate","copy"],
    sound: ["sound","music","audio"],
    touch: ["touch","collision","hit"],
    mouse: ["mouse","cursor"],
    timer: ["timer","clock"],
    appearance: ["looks","appearance","costume"]
};
const SEARCH_INTENTS = {

    loop: [
        "repeat",
        "repeat until",
        "forever"
    ],

    add: [
        "+",
        "addition",
        "sum",
        "plus"
    ],

    subtract: [
        "-",
        "minus",
        "difference"
    ],

    multiply: [
        "*",
        "times",
        "product"
    ],

    divide: [
        "/",
        "quotient"
    ],

    condition: [
        "if",
        "if else"
    ],

    variable: [
        "set",
        "change",
        "variable"
    ],

    message: [
        "broadcast",
        "event"
    ],

    clone: [
        "create clone",
        "delete clone"
    ],

    move: [
        "move",
        "glide",
        "go to"
    ],

    sound: [
        "play sound",
        "start sound"
    ],

    math: [
        "+",
        "-",
        "*",
        "/",
        "random",
        "round"
    ]
};
// PERSISTENT MEMORY STORAGE HOOK: Safely stringify and parse history frames
let recentBlocksHistory = [];
try {
    const savedHistory = localStorage.getItem("gandi_search_recents");
    if (savedHistory) {
        recentBlocksHistory = JSON.parse(savedHistory);
    }
} catch (storageErr) {
    console.warn("Local storage cache allocation failed:", storageErr);
}

window.addEventListener("mousemove", e => {
    window.mouseX = e.clientX;
    window.mouseY = e.clientY;
}, true);

(function () {
    'use strict';

    if (window.__BlokSearchMainLoaded) return;
    window.__BlokSearchMainLoaded = true;

    console.log("Gandhi Block Search v2.9.8 - Control Panel Engaged");

    function waitForBlockly(callback) {
        const timer = setInterval(() => {
            if (window.Blockly?.getMainWorkspace()) {
                clearInterval(timer);
                callback();
            }
        }, 1000);
    }

    function getHoveredConnection(ws) {
        const hovered = document.elementFromPoint(window.mouseX, window.mouseY);
        if (!hovered) return null;

        let el = hovered;
        let foundBlockSvg = null;

        while (el) {
            if (el.blocklyBlock_) {
                foundBlockSvg = el.blocklyBlock_;
                break;
            }
            const dataId = el.getAttribute ? el.getAttribute("data-id") : null;
            if (dataId) {
                const b = ws.getBlockById(dataId);
                if (b) {
                    foundBlockSvg = b;
                    break;
                }
            }
            el = el.parentElement;
        }

        if (!foundBlockSvg) return null;

        if (typeof foundBlockSvg.isShadow === "function" && foundBlockSvg.isShadow()) {
            const parentBlock = foundBlockSvg.getParent();
            if (parentBlock) {
                for (let i = 0; i < parentBlock.inputList.length; i++) {
                    const input = parentBlock.inputList[i];
                    if (input.connection && input.connection.targetBlock() === foundBlockSvg) {
                        return input.connection;
                    }
                }
            }
        }

        if (foundBlockSvg.outputConnection && foundBlockSvg.outputConnection.targetConnection) {
            return foundBlockSvg.outputConnection.targetConnection;
        }

        try {
            const svgCanvas = ws.getCanvas();
            const svgRoot = ws.getParentSvg();
            if (svgCanvas && svgRoot && svgCanvas.getScreenCTM) {
                const pt = svgRoot.createSVGPoint();
                pt.x = window.mouseX;
                pt.y = window.mouseY;

                const wsPt = pt.matrixTransform(svgCanvas.getScreenCTM().inverse());

                for (let i = 0; i < foundBlockSvg.inputList.length; i++) {
                    const input = foundBlockSvg.inputList[i];
                    if (input.connection && input.connection.type === window.Blockly.INPUT_VALUE) {
                        const isPointy = input.connection.check_ && input.connection.check_.includes("Boolean");

                        if (isPointy) {
                            const connX = input.connection.x_ !== undefined ? input.connection.x_ : input.connection.x;
                            const connY = input.connection.y_ !== undefined ? input.connection.y_ : input.connection.y;

                            if (connX !== undefined && connY !== undefined) {
                                const dx = wsPt.x - connX;
                                const dy = wsPt.y - connY;
                                const distance = Math.sqrt(dx * dx + dy * dy);

                                if (distance < 80) {
                                    return input.connection;
                                }
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Pointy coordinates check pipeline broke:", err);
        }

        const validInputs = foundBlockSvg.inputList.filter(input => input.connection && input.connection.type === window.Blockly.INPUT_VALUE);
        if (validInputs.length > 0) {
            try {
                const rect = foundBlockSvg.getSvgRoot().getBoundingClientRect();
                const relativeX = window.mouseX - rect.left;
                const index = Math.max(0, Math.min(Math.floor((relativeX / rect.width) * validInputs.length), validInputs.length - 1));
                return validInputs[index].connection;
            } catch(e){}
        }

        return null;
    }

    function applyNewBlockHighlight(block) {
        const svgGroup = block.getSvgRoot();
        if (!svgGroup) return;

        svgGroup.style.filter = "drop-shadow(0px 0px 12px #FFD700) drop-shadow(0px 0px 4px #FFD700)";
        svgGroup.style.transition = "filter 0.3s ease";

        const removeHighlight = () => {
            svgGroup.style.filter = "";
            svgGroup.removeEventListener("mousedown", removeHighlight);
        };
        svgGroup.addEventListener("mousedown", removeHighlight);

        setTimeout(() => {
            if (block.getParent && block.getParent()) {
                svgGroup.style.filter = "";
                svgGroup.removeEventListener("mousedown", removeHighlight);
            }
        }, 100);
    }

    function insertBlock(entry, spawnX, spawnY) {
        const ws = window.Blockly.getMainWorkspace();
        let block = null;

        recentBlocksHistory = recentBlocksHistory.filter(item => item.type !== entry.type);
        recentBlocksHistory.unshift(entry);
        if (recentBlocksHistory.length > 15) recentBlocksHistory.pop();

        try {
            localStorage.setItem("gandi_search_recents", JSON.stringify(recentBlocksHistory));
        } catch(e){}

        try {
            if (entry.xml) {
                block = window.Blockly.Xml.domToBlock(entry.xml, ws);
            }
        } catch (e) {
            console.error("XML insert failed:", e);
        }

        if (!block) {
            block = ws.newBlock(entry.type);
            block.initSvg();
        }

        if (targetedConnection && block.outputConnection) {
            try {
                const existingTarget = targetedConnection.targetBlock();
                if (existingTarget) {
                    existingTarget.unplug(false);
                    if (existingTarget.isShadow()) {
                        existingTarget.dispose(false);
                    }
                }

                targetedConnection.connect(block.outputConnection);
                block.render();

                if (targetedConnection.sourceBlock_) {
                    const source = targetedConnection.sourceBlock_;
                    const originalBump = source.bumpNeighbours_;
                    source.bumpNeighbours_ = function() {};
                    source.render();
                    setTimeout(() => { source.bumpNeighbours_ = originalBump; }, 50);

                    if (window.Blockly.Events.isEnabled()) {
                        window.Blockly.Events.fire(new window.Blockly.Events.BlockMove(block));
                    }
                }

                targetedConnection = null;
                return block;
            } catch (err) {
                console.warn("Direct field connection attachment failed:", err);
            }
        }

        try {
            const svgCanvas = ws.getCanvas();
            const svgRoot = ws.getParentSvg();

            if (svgCanvas && svgRoot && svgCanvas.getScreenCTM) {
                const pt = svgRoot.createSVGPoint();
                pt.x = spawnX;
                pt.y = spawnY;

                const matrix = svgCanvas.getScreenCTM().inverse();
                const wsPt = pt.matrixTransform(matrix);

                const currentXY = block.getRelativeToSurfaceXY ? block.getRelativeToSurfaceXY() : { x: 0, y: 0 };

                block.moveBy(wsPt.x - currentXY.x, wsPt.y - currentXY.y);
                block.render();
                applyNewBlockHighlight(block);
                return block;
            }
        } catch (metricsErr) {
            console.error("Coordinate matrix projection routine failed:", metricsErr);
        }

        const metrics = ws.getMetrics();
        block.moveBy(metrics.viewLeft + 300, metrics.viewTop + 200);
        block.render();
        applyNewBlockHighlight(block);
        return block;
    }

    // Helper function to seamlessly start the Blockly Drag gesture
    function startDraggingBlock(block, originalEvent) {
        if (!block) return;
        setTimeout(() => {
            const svgRoot = block.getSvgRoot();
            if (svgRoot) {
                const dragEvent = new MouseEvent('mousedown', {
                    bubbles: true,
                    cancelable: true,
                    clientX: originalEvent.clientX,
                    clientY: originalEvent.clientY,
                    button: 0
                });
                svgRoot.dispatchEvent(dragEvent);
            }
        }, 10);
    }

    function formatParameterText(labelText) {
        const parameterRegex = /(%[a-zA-Z0-9]+|\[[^\]]+\]|"[^"]*"|\b\d+\b)/g;

        return labelText.replace(parameterRegex, match => {
            return `<span style="
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                font-weight: 600;
                background: rgba(0, 0, 0, 0.25);
                padding: 1px 4px;
                border-radius: 3px;
                color: #fff;
                font-size: 10.5px;
                margin: 0 1px;
                display: inline-block;
                line-height: 12px;
            ">${match}</span>`;
        });
    }

    function getBlockFrameStyle(entry, maxWidth) {
        const isBooleanBlock = entry.outputCheck && entry.outputCheck.includes("Boolean");
        const isReporterBlock = !isBooleanBlock && entry.hasOutput;
        const shapeStyle = isBooleanBlock
            ? `
            border-radius: 0;
            clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 10px 100%, 0 50%);
        `
            : isReporterBlock
                ? `
            border-radius: 999px;
        `
                : `
            border-radius: 4px;
            clip-path: polygon(0 0, 30px 0, 35px 5px, 55px 5px, 60px 0, 100% 0, 100% calc(100% - 5px), 60px calc(100% - 5px), 55px 100%, 35px 100%, 30px calc(100% - 5px), 0 calc(100% - 5px));
        `;

        return `
            background: ${entry.color};
            color: white;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 500;
            ${shapeStyle}
            border-left: 12px solid rgba(0,0,0,0.15);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -2px 0 rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.15);
            max-width: ${maxWidth};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
    }

    function calculateSearchScore(entry, query) {

        if (!query) return 1;

        const q = query.toLowerCase();

        let score = 0;

        const label =
              (entry.label || "").toLowerCase();

        const category =
              (entry.category || "").toLowerCase();

        if (label === q)
            score += 1000;

        if (label.startsWith(q))
            score += 500;

        if (label.includes(q))
            score += 250;

        if (category.includes(q))
            score += 100;

        Object.entries(SEARCH_INTENTS)
            .forEach(([intent, keywords]) => {

            if (
                q === intent ||
                intent.includes(q)
            ) {

                keywords.forEach(keyword => {

                    if (
                        label.includes(
                            keyword.toLowerCase()
                        )
                    ) {
                        score += 400;
                    }

                });
            }

        });

        return score;
    }
    function buildRecentItemUI(entry, container, searchPanel) {
        const itemRow = document.createElement("div");
        itemRow.style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 4px 6px;
            margin-bottom: 5px;
            border-radius: 6px;
            cursor: pointer;
            transition: background 0.1s;
        `;

        let isPointyBlock = entry.outputCheck && entry.outputCheck.includes("Boolean");
        let borderFormatting = "4px";
        if (isPointyBlock) borderFormatting = "10px / 50%";
        else if (entry.hasOutput) borderFormatting = "12px";

        const blockFrame = document.createElement("div");
        blockFrame.style.cssText = getBlockFrameStyle(entry, "90%");
        blockFrame.innerHTML = formatParameterText(entry.label);
        itemRow.appendChild(blockFrame);

        itemRow.onmouseenter = () => { itemRow.style.background = "rgba(255,255,255,0.08)"; };
        itemRow.onmouseleave = () => { itemRow.style.background = "transparent"; };

        // Changed from onclick to onmousedown for immediate drag support
        itemRow.onmousedown = (e) => {
            if (e.button !== 0) return; // Only process left click
            e.preventDefault();
            e.stopPropagation();

            const createdBlock = insertBlock(entry, window.mouseX, window.mouseY);
            searchPanel.remove();
            startDraggingBlock(createdBlock, e);
        };

        container.appendChild(itemRow);
    }

    function openSearch() {
        const existingBox = document.getElementById("gandi-search");
        if (existingBox) existingBox.remove();

        const ws = window.Blockly?.getMainWorkspace();
        if (!ws) return;

        targetedConnection = getHoveredConnection(ws);
        let reporterMode = !!targetedConnection;

        let isBooleanTarget = false;
        if (targetedConnection && targetedConnection.check_ && targetedConnection.check_.includes("Boolean")) {
            isBooleanTarget = true;
        }

        cachedBlocks = null;
        const box = document.createElement("div");
        box.id = "gandi-search";

        const width = 450;
        const height = 580;
        let left = window.mouseX;
        let top = window.mouseY;

        if (left + width > window.innerWidth) left = window.innerWidth - width - 20;
        if (top + height > window.innerHeight) top = window.innerHeight - height - 20;

        box.style.cssText = `
            position:fixed;
            top:${top}px;
            left:${left}px;
            width:${width}px;
            height:${height}px;
            background:#1e1e1e;
            color:white;
            border:1px solid #555;
            border-radius:8px;
            z-index:2147483647;
            padding:12px;
            font-family: sans-serif;
            box-shadow:0 8px 30px rgba(0,0,0,0.6);
            display: flex;
            flex-direction: column;
            box-sizing: border-box;
        `;

        box.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <div id="gandi-title" style="
                    font-size: 11px;
                    font-weight: 600;
                    color: #aaa;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    padding-left: 2px;
                ">Block Search</div>

                <div id="gandi-btn-group" style="display: flex; gap: 4px;">
                    <button id="btn-tidy" title="Organize layout position grids" style="background:#2d2d2d; color:#fff; border:1px solid #444; border-radius:4px; font-size:10px; padding:3px 8px; cursor:pointer;">Tidy</button>
                    <button id="btn-clean-unused" title="Delete unattached loose block fragments" style="background:#b45309; color:#fff; border:none; border-radius:4px; font-size:10px; padding:3px 8px; cursor:pointer;">Clean Unused</button>
                    <button id="btn-delete-all" title="Clear entire workspace layout canvas" style="background:#991b1b; color:#fff; border:none; border-radius:4px; font-size:10px; padding:3px 8px; cursor:pointer;">Delete All</button>
                </div>
            </div>
            <input id="gandi-input"
                placeholder="${isBooleanTarget ? 'Search pointy blocks...' : 'Search block or category...'}"
                autocomplete="off"
                style="
                    width:100%;
                    padding:8px;
                    background:#2d2d2d;
                    color:white;
                    border:none;
                    outline:none;
                    border-radius:4px;
                    box-sizing:border-box;
                    font-size: 13px;
                    margin-bottom: 6px;
                    border-bottom: 2px solid ${isBooleanTarget ? '#06b6d4' : '#555'};
                ">
            <div id="gandi-results" style="flex: 1; overflow-y: auto; padding-right: 2px;"></div>

            <div id="gandi-recent-dashboard" style="
                position: absolute;
                left: ${width + 12}px;
                top: 0px;
                width: 250px;
                height: ${height}px;
                background: #181818;
                border: 1px solid #454545;
                border-radius: 8px;
                padding: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.5);
                display: flex;
                flex-direction: column;
                box-sizing: border-box;
            ">
                <div style="font-size: 11px; font-weight: 600; color: #888; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 10px;">Recently Used</div>
                <div id="gandi-recent-list" style="flex: 1; overflow-y: auto; padding-right: 2px;"></div>
            </div>
        `;

        document.body.appendChild(box);

        function handleOutsidePanelClick(e) {
            if (!box.contains(e.target)) {
                box.remove();
            }
        }

        const originalBoxRemove = box.remove.bind(box);

        box.remove = function () {
            document.removeEventListener(
                "mousedown",
                handleOutsidePanelClick,
                true
            );

            originalBoxRemove();
        };

        setTimeout(() => {
            document.addEventListener(
                "mousedown",
                handleOutsidePanelClick,
                true
            );
        }, 0);

        const input = document.getElementById("gandi-input");
        const results = document.getElementById("gandi-results");
        const recentDashboard = document.getElementById("gandi-recent-dashboard");
        const recentListContainer = document.getElementById("gandi-recent-list");

        if (left + width + 270 > window.innerWidth) {
            recentDashboard.style.left = "-262px";
        }

        if (recentBlocksHistory.length === 0) {
            recentListContainer.innerHTML = `<div style="font-size: 11px; color: #555; font-style: italic; text-align: center; margin-top: 20px;">No blocks used yet.</div>`;
        } else {
            recentBlocksHistory.forEach(entry => buildRecentItemUI(entry, recentListContainer, box));
        }

        document.getElementById("btn-tidy").onclick = () => {
            ws.cleanUp();
            box.remove();
        };

        document.getElementById("btn-clean-unused").onclick = () => {
            const allTopBlocks = ws.getTopBlocks(false);
            let targetCount = 0;
            allTopBlocks.forEach(b => {
                if (b.startHat_ || b.type.startsWith('event_') || b.type.startsWith('when')) return;

                if (!b.outputConnection && !b.previousConnection) {
                    b.dispose(false, true);
                    targetCount++;
                }
            });
            console.log(`Cleaned ${targetCount} orphan blocks from layout canvas context.`);
            box.remove();
        };

        document.getElementById("btn-delete-all").onclick = () => {
            if (confirm("Are you sure you want to completely clear the entire workspace canvas layout?")) {
                ws.clear();
                box.remove();
            }
        };

        let selectedIndex = 0;
        let filteredEntries = [];

        function renderResults() {
            results.innerHTML = "";

            filteredEntries.forEach((entry, index) => {
                const row = document.createElement("div");
                row.style.cssText = `
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 4px 6px;
                    margin-bottom: 4px;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.1s;
                `;

                if (index === selectedIndex) {
                    row.style.background = "rgba(255,255,255,0.12)";
                }

                let isPointyBlock = entry.outputCheck && entry.outputCheck.includes("Boolean");
                let borderFormatting = "4px";
                if (isPointyBlock) borderFormatting = "10px / 50%";
                else if (entry.hasOutput) borderFormatting = "12px";

                const blockFrame = document.createElement("div");
                blockFrame.style.cssText = getBlockFrameStyle(entry, "75%");

                blockFrame.innerHTML = formatParameterText(entry.label);

                const categoryLabel = document.createElement("span");
                const categoryText = entry.category ? entry.category.charAt(0).toUpperCase() + entry.category.slice(1) : "Custom";
                categoryLabel.textContent = `[${categoryText}]`;
                categoryLabel.style.cssText = `
                    font-size: 10px;
                    color: #888;
                    font-weight: normal;
                    padding-left: 8px;
                    white-space: nowrap;
                `;

                row.appendChild(blockFrame);
                row.appendChild(categoryLabel);

                row.onmouseenter = () => {
                    selectedIndex = index;
                    [...results.children].forEach((r, i) => {
                        r.style.background = i === selectedIndex ? "rgba(255,255,255,0.12)" : "";
                    });
                };

                // Changed from onclick to onmousedown for immediate drag support
                row.onmousedown = (e) => {
                    if (e.button !== 0) return; // Only process left click
                    e.preventDefault();
                    e.stopPropagation();

                    const createdBlock = insertBlock(entry, window.mouseX, window.mouseY);
                    box.remove();
                    startDraggingBlock(createdBlock, e);
                };

                results.appendChild(row);
            });

            const selectedRow = results.children[selectedIndex];
            if (selectedRow) {
                selectedRow.scrollIntoView({ block: "nearest" });
            }
        }

        function refresh() {
            const q = input.value.toLowerCase();

            if (!cachedBlocks) {
                cachedBlocks = ws.getToolbox()
                    .flyout_
                    .workspace_
                    .getTopBlocks(false)
                    .map(b => {
                        let xml = null;
                        try { xml = window.Blockly.Xml.blockToDom(b, true); } catch (e) {}

                        let outputCheck = null;
                        if (b.outputConnection && b.outputConnection.check_) {
                            outputCheck = b.outputConnection.check_;
                        }

                        return {
                            type: b.type,
                            label: b.toString(),
                            category: b.category_ || "",
                            color: b.colour_ || "#666",
                            hasOutput: !!b.outputConnection,
                            outputCheck: outputCheck,
                            outputConnection: b.outputConnection,
                            xml: xml
                        };
                    });
                console.table(
                    cachedBlocks.map(b => ({
                        type: b.type,
                        label: b.label
                    }))
                );
            }
             if (q.trim() === "") {

               filteredEntries = [...cachedBlocks];

               selectedIndex = 0;
               renderResults();
               return;
           }
            // SMART SEARCH HERE
        const matchedIntentKeys =
              q.trim() === ""
        ? []
        : Object.entries(SEARCH_SYNONYMS)
        .filter(([key, words]) =>
                words.some(word =>
                           word.startsWith(q)
                          )
               )
        .map(([key]) => key);

           const intentBlocks =
                 matchedIntentKeys.flatMap(
                     key => SMART_SEARCH[key] || []
                 );
            console.log(
                q,
                matchedIntentKeys,
                intentBlocks.length
            );
        let smartResults = [];

            if (intentBlocks.length) {

                smartResults = cachedBlocks.filter(entry =>
                                                   intentBlocks.includes(entry.type)
                                                  );

                smartResults.forEach(entry => {
                    entry.searchScore = 5000;
                });
            }
const normalResults = cachedBlocks.filter(entry => {

    if (reporterMode && !entry.hasOutput)
        return false;

    if (targetedConnection && entry.outputConnection) {
        try {
            if (!targetedConnection.checkType_(entry.outputConnection))
                return false;
        } catch(err) {
            if (
                targetedConnection.check_ &&
                entry.outputConnection.check_
            ) {
                const match =
                    targetedConnection.check_.some(
                        c =>
                            entry.outputConnection.check_.includes(c)
                    );

                if (!match)
                    return false;
            }
        }
    }

    const isEntryBoolean =
        entry.outputCheck &&
        entry.outputCheck.includes("Boolean");

    if (isBooleanTarget) {
        if (!isEntryBoolean)
            return false;
    } else if (reporterMode) {
        if (isEntryBoolean)
            return false;
    }

    const score =
          calculateSearchScore(
              entry,
              q
          );

    entry.searchScore = score;

    return score > 0;
});

            filteredEntries = [
                ...smartResults,
                ...normalResults
            ];

            // Remove duplicates
            filteredEntries = [
                ...new Map(
                    filteredEntries.map(
                        item => [item.type, item]
                    )
                ).values()
            ];

            filteredEntries = filteredEntries
                .sort(
                (a, b) =>
                (b.searchScore || 9999) -
                (a.searchScore || 9999)
            )
                .slice(0, 100);

            selectedIndex = 0;
            renderResults();
        }

        input.addEventListener("input", refresh);

        input.addEventListener("keydown", e => {
            if (!filteredEntries.length) return;

            if (e.key === "ArrowDown") {
                e.preventDefault();
                selectedIndex = Math.min(selectedIndex + 1, filteredEntries.length - 1);
                renderResults();
            } else if (e.key === "ArrowUp") {
                e.preventDefault();
                selectedIndex = Math.max(selectedIndex - 1, 0);
                renderResults();
            } else if (e.key === "Enter") {
                e.preventDefault();
                const entry = filteredEntries[selectedIndex];
                if (!entry) return;

                insertBlock(entry, window.mouseX, window.mouseY);
                box.remove();
            }
        });

        refresh();
        setTimeout(() => { input.focus(); }, 20);
    }

    waitForBlockly(() => {
        window.addEventListener("keydown", e => {
            if (e.ctrlKey && e.code === "Space") {
                e.preventDefault();
                e.stopPropagation();

                setTimeout(() => {
                    try {
                        openSearch();
                    } catch (err) {
                        console.error("Search error:", err);
                    }
                }, 50);
            }

            if (e.key === "Escape") {
                document.getElementById("gandi-search")?.remove();
            }
        }, true);
    });

})();