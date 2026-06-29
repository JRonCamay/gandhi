// blockDatabase.js
(function () {

const db = {};

Composer.blocks = db;

db.ready = false;
db.version = 0;

db.list = [];
db.byOpcode = {};
db.byPattern = {};
db.byCategory = {};
db.byPrefix = {};

db.rebuild = function () {

    db.clear();

    addManualLibrary();

    scanBlocklyToolbox();

    buildPrefixIndex();

    db.ready = true;
    db.version++;

    console.log(
        "[Composer.blocks] Ready:",
        db.list.length,
        "blocks"
    );

    return db.list;

};

db.clear = function () {

    db.list = [];
    db.byOpcode = {};
    db.byPattern = {};
    db.byCategory = {};
    db.byPrefix = {};

};

db.getAll = function () {

    if (!db.ready) {
        db.rebuild();
    }

    return db.list;

};

db.search = function (text) {

    if (!db.ready) {
        db.rebuild();
    }

    const q = normalize(text);

    if (!q) return [];

    return db.list
        .map(block => ({
            block,
            score: scoreBlock(q, block)
        }))
        .filter(x => x.score > 0)
        .sort((a,b) => b.score - a.score)
        .map(x => x.block);

};

db.find = function (idOrOpcodeOrPattern) {

    if (!db.ready) {
        db.rebuild();
    }

    return db.byOpcode[idOrOpcodeOrPattern] ||
           db.byPattern[normalize(idOrOpcodeOrPattern)] ||
           null;

};

function addManualLibrary() {

    if (!Array.isArray(Composer.library)) return;

    for (const item of Composer.library) {
        addBlock(normalizeManualBlock(item));
    }

}

function normalizeManualBlock(item) {

    return {
        id: item.id,
        block: item.block,
        opcode: item.block,
        category: getCategoryFromOpcode(item.block),
        pattern: item.pattern,
        preview: item.preview,
        params: item.params || [],
        source: "manual"
    };

}

function scanBlocklyToolbox() {

    const workspace = getWorkspace();

    if (!workspace) return;

    const flyout = getFlyoutWorkspace(workspace);

    if (!flyout) return;

    const blocks = flyout.getTopBlocks(false) || [];

    for (const block of blocks) {

        const entry = blockToEntry(block);

        if (entry) {
            addBlock(entry);
        }

    }

}

function getWorkspace() {

    if (window.Blockly && Blockly.getMainWorkspace) {
        return Blockly.getMainWorkspace();
    }

    if (
        Composer.blockly &&
        Composer.blockly.workspace
    ) {
        return Composer.blockly.workspace;
    }

    return null;

}

function getFlyoutWorkspace(workspace) {

    try {

        const toolbox = workspace.getToolbox && workspace.getToolbox();

        if (
            toolbox &&
            toolbox.flyout_ &&
            toolbox.flyout_.workspace_
        ) {
            return toolbox.flyout_.workspace_;
        }

    } catch (e) {}

    return null;

}

function blockToEntry(block) {

    if (!block || !block.type) return null;

    const pattern = getPatternFromBlock(block);

    if (!pattern) return null;

    return {
        id: block.type,
        block: block.type,
        opcode: block.type,
        category: getCategoryFromBlocklyBlock(block),
        pattern,
        preview: pattern.replace(/\[\]/g, "()"),
        params: getParamsFromBlock(block),
        color: block.getColour ? block.getColour() : block.colour_,
        source: "runtime"
    };

}

function getPatternFromBlock(block) {

    let text = "";

    try {
        text = block.toString();
    } catch (e) {
        text = block.type;
    }

    if (!text) return null;

    text = String(text)
        .replace(/\s+/g, " ")
        .trim();

    const params = getParamsFromBlock(block);

    for (const param of params) {
        text = replaceFirstParameterLikeText(text, param.name);
    }

    return text;

}

function replaceFirstParameterLikeText(text, name) {

    if (!name) return text;

    const escaped = escapeRegex(name);

    const re = new RegExp(escaped, "i");

    if (re.test(text)) {
        return text.replace(re, "[]");
    }

    return text;

}

function getParamsFromBlock(block) {

    const params = [];

    if (!Array.isArray(block.inputList)) {
        return params;
    }

    for (const input of block.inputList) {

        if (!input.connection) continue;

        params.push({
            name: input.name || "value",
            type: getParamType(input)
        });

    }

    return params;

}

function getParamType(input) {

    const check = input.connection &&
        (
            input.connection.getCheck &&
            input.connection.getCheck()
        );

    const checkText = Array.isArray(check)
        ? check.join(" ").toLowerCase()
        : String(check || "").toLowerCase();

    if (checkText.includes("boolean")) return "boolean";
    if (checkText.includes("number")) return "number";
    if (checkText.includes("colour") || checkText.includes("color")) return "color";

    return "reporter";

}

function addBlock(block) {

    if (!block || !block.pattern || !block.block) return;

    const key = block.block;
    const patternKey = normalize(block.pattern);

    if (db.byOpcode[key]) {
        return;
    }

    db.list.push(block);
    db.byOpcode[key] = block;
    db.byPattern[patternKey] = block;

    const category = block.category || "unknown";

    if (!db.byCategory[category]) {
        db.byCategory[category] = [];
    }

    db.byCategory[category].push(block);

}

function buildPrefixIndex() {

    for (const block of db.list) {

        const words = normalize(block.pattern).split(" ");

        let prefix = "";

        for (const word of words) {

            prefix = prefix ? prefix + " " + word : word;

            if (!db.byPrefix[prefix]) {
                db.byPrefix[prefix] = [];
            }

            db.byPrefix[prefix].push(block);

        }

    }

}

function scoreBlock(q, block) {

    const p = normalize(block.pattern);

    if (p === q) return 1000;
    if (p.startsWith(q)) return 800;
    if (p.includes(q)) return 500;

    return 0;

}

function getCategoryFromOpcode(opcode) {

    const first = String(opcode || "").split("_")[0];

    return first || "unknown";

}

function getCategoryFromBlocklyBlock(block) {

    return block.category_ ||
           getCategoryFromOpcode(block.type);

}

function normalize(text) {

    return String(text || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}

function escapeRegex(text) {

    return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

}

/* Auto rebuild after page settles */
setTimeout(() => {
    try {
        db.rebuild();
    } catch (e) {
        console.warn("[Composer.blocks] rebuild failed", e);
    }
}, 1500);

})();
