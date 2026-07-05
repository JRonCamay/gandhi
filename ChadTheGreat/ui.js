window.Chad = window.Chad || {};

(function () {
    "use strict";

    const ui = {};
    let panel = null;
    let body = null;
    let bodyHost = null;
    let monkeyDock = null;
    let didInitialAutoOpen = false;

    const GLOBAL_AGENTS_KEY = "gandhi_chad_global_agents_v1";
    const ACTIVE_AGENT_KEY = "gandhi_chad_active_agent_id_v1";
    const DONE_FLASH_KEY = "gandhi_chad_task_done_flash_v1";
    const NORMAL_TITLE_KEY = "gandhi_chad_normal_title_v1";

    function createEl(tag, props = {}, children = []) {
        const node = document.createElement(tag);
        for (const [key, value] of Object.entries(props)) {
            if (key === "style") Object.assign(node.style, value);
            else if (key === "text") node.textContent = value;
            else if (key === "html") node.innerHTML = value;
            else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), value);
            else node.setAttribute(key, value);
        }
        for (const child of children) {
            if (typeof child === "string") node.appendChild(document.createTextNode(child));
            else if (child) node.appendChild(child);
        }
        return node;
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function button(label, fn, extra = {}) {
        return createEl("button", {
            text: label,
            title: extra.title || "",
            onclick: event => {
                event.preventDefault();
                event.stopPropagation();
                fn(event);
            },
            style: {
                background: extra.bg || "#f8fafc",
                color: extra.color || "#0f172a",
                border: "1px solid " + (extra.border || "#cbd5e1"),
                borderRadius: "6px",
                padding: extra.padding || "4px 7px",
                fontSize: extra.fontSize || "11px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: extra.bold ? "700" : "500"
            }
        });
    }

    function bodyStyle() {
        return {
            padding: "8px",
            overflowY: "auto",
            flex: "1 1 auto",
            minHeight: "0",
            background: "#ffffff"
        };
    }

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? (JSON.parse(raw) || fallback) : fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function currentChatUrl() {
        return location.href.includes("/c/") ? location.href.split("#")[0] : "https://chatgpt.com/";
    }

    function normalizeUrl(url) {
        try {
            const parsed = new URL(url);
            parsed.hash = "";
            return parsed.href;
        }
        catch {
            return String(url || "").split("#")[0];
        }
    }

    function nowStamp() {
        return window.Chad.storage && window.Chad.storage.nowStamp
            ? window.Chad.storage.nowStamp()
            : new Date().toLocaleString();
    }

    function defaultAgents() {
        return [
            {
                id: "agent-brenda",
                icon: "👩🏼",
                name: "Brenda",
                description: "Chad architect and developer.",
                chatUrl: currentChatUrl(),
                tabTitle: "👩🏼 Brenda",
                files: [],
                createdAt: nowStamp(),
                updatedAt: nowStamp()
            },
            {
                id: "agent-shaggy",
                icon: "🧔",
                name: "Shaggy",
                description: "Another ChatGPT tab.",
                chatUrl: "https://chatgpt.com/",
                tabTitle: "🧔 Shaggy",
                files: [],
                createdAt: nowStamp(),
                updatedAt: nowStamp()
            }
        ];
    }

    function migrateOldAgents() {
        const existing = loadJSON(GLOBAL_AGENTS_KEY, null);
        if (Array.isArray(existing) && existing.length) return existing;

        const migrated = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (!key || !key.startsWith("gandhi_chad_agents_v1:")) continue;

            const old = loadJSON(key, []);
            if (!Array.isArray(old)) continue;

            for (const agent of old) {
                if (!agent || !agent.id || migrated.some(item => item.id === agent.id)) continue;
                migrated.push({
                    ...agent,
                    tabTitle: agent.tabTitle || `${agent.icon || "🤖"} ${agent.name || "Agent"}`,
                    files: agent.files || []
                });
            }
        }

        const agents = migrated.length ? migrated : defaultAgents();
        saveJSON(GLOBAL_AGENTS_KEY, agents);
        return agents;
    }

    function getAgents() {
        const agents = migrateOldAgents();
        let changed = false;
        for (const agent of agents) {
            if (!agent.files) {
                agent.files = [];
                changed = true;
            }
            if (!agent.tabTitle) {
                agent.tabTitle = `${agent.icon || "🤖"} ${agent.name || "Agent"}`;
                changed = true;
            }
        }
        if (changed) saveAgents(agents);
        return agents;
    }

    function saveAgents(agents) {
        saveJSON(GLOBAL_AGENTS_KEY, agents);
    }

    function getActiveAgentId() {
        const agents = getAgents();
        const here = normalizeUrl(currentChatUrl());
        const match = agents.find(agent => agent.chatUrl && normalizeUrl(agent.chatUrl) === here);
        if (match) {
            localStorage.setItem(ACTIVE_AGENT_KEY, match.id);
            return match.id;
        }

        const saved = localStorage.getItem(ACTIVE_AGENT_KEY);
        if (agents.some(agent => agent.id === saved)) return saved;
        return agents[0] ? agents[0].id : "";
    }

    function setActiveAgentId(id) {
        localStorage.setItem(ACTIVE_AGENT_KEY, id || "");
    }

    function getActiveAgent() {
        const id = getActiveAgentId();
        return getAgents().find(agent => agent.id === id) || getAgents()[0] || null;
    }

    function setFavicon(icon) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="48">${icon || "🤖"}</text></svg>`;
        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        let link = document.querySelector("link[data-chad-favicon]");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            link.dataset.chadFavicon = "1";
            document.head.appendChild(link);
        }
        link.href = url;
    }

    function isDoneFlashing() {
        return Date.now() < Number(localStorage.getItem(DONE_FLASH_KEY) || 0);
    }

    function applyTabIdentity() {
        const agent = getActiveAgent();
        if (!agent) return;

        const done = isDoneFlashing();
        const icon = done ? "✅" : (agent.icon || "🤖");
        const normalTitle = agent.name ? `${agent.name} — ChatGPT` : "ChatGPT";
        if (!done) localStorage.setItem(NORMAL_TITLE_KEY, normalTitle);
        document.title = done ? `✅ ${agent.name || "Agent"} — ChatGPT` : normalTitle;
        setFavicon(icon);
    }

    function playDoneSound() {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            const audio = new AudioContext();
            const osc = audio.createOscillator();
            const gain = audio.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(880, audio.currentTime);
            gain.gain.setValueAtTime(0.0001, audio.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.16, audio.currentTime + 0.03);
            gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + 0.22);
            osc.connect(gain);
            gain.connect(audio.destination);
            osc.start();
            osc.stop(audio.currentTime + 0.24);
        }
        catch {}
    }

    function markDoneFlash() {
        localStorage.setItem(DONE_FLASH_KEY, String(Date.now() + 600000));
        playDoneSound();
        if (window.Chad.bridge && window.Chad.bridge.doneTabFeedback) {
            window.Chad.bridge.doneTabFeedback().catch(() => {});
        }
        applyTabIdentity();
        render();
    }

    function resetDoneFlash() {
        localStorage.removeItem(DONE_FLASH_KEY);
        if (window.Chad.bridge && window.Chad.bridge.resetTabFeedback) {
            window.Chad.bridge.resetTabFeedback().catch(() => {});
        }
        const normalTitle = localStorage.getItem(NORMAL_TITLE_KEY);
        if (normalTitle) document.title = normalTitle;
        applyTabIdentity();
        render();
    }

    function scrollToLatest() {
        setTimeout(() => {
            try {
                [
                    document.querySelector("main"),
                    document.querySelector("[role='main']"),
                    document.scrollingElement,
                    document.documentElement,
                    document.body
                ].filter(Boolean).forEach(target => target.scrollTop = target.scrollHeight);
                window.scrollTo(0, document.body.scrollHeight);
            }
            catch {}
        }, 900);
    }

    function getTaskRulesText() {
        return `TASK FORMATTING RULES\n\nEvery task should use this format:\n\n🚨 CH-001 🚨\n\nProject:\nChadTheGreat\n\nTitle:\nShort title\n\nTimestamp:\nYYYY-MM-DD\n\nTask:\nExact instruction here.\n\nRules:\n- Keep it simple.\n- One feature at a time.\n- Do not touch unrelated files.\n\nFiles to touch:\n- file.js\n\nFiles not to touch:\n- unrelated.js\n\nCompletion report:\n🔥🔥🔥 CH-001 COMPLETED 🔥🔥🔥\nCH-001 COMPLETED\nCH-001 COMPLETED`;
    }

    function scanVisibleChatFiles() {
        const map = new Map();

        function addFile(name, url, source) {
            const cleanName = String(name || "").trim();
            const cleanUrl = String(url || "").trim();
            if (!cleanName && !cleanUrl) return;

            const key = (cleanUrl || cleanName).toLowerCase();
            if (!map.has(key)) {
                map.set(key, {
                    id: "file-" + Date.now() + "-" + map.size,
                    name: cleanName || cleanUrl,
                    url: cleanUrl,
                    source: source || "visible chat",
                    addedAt: nowStamp()
                });
            }
        }

        const filePattern = /([A-Za-z0-9_./-]+\.(?:png|jpg|jpeg|webp|gif|pdf|js|txt|md|json|zip))/gi;
        document.querySelectorAll("a[href]").forEach(anchor => {
            const href = anchor.href || "";
            const text = anchor.textContent || "";
            if (/github\.com|raw\.githubusercontent\.com|sandbox:|\.png|\.jpg|\.jpeg|\.webp|\.gif|\.pdf|\.js|\.txt|\.md|\.json|\.zip/i.test(href + " " + text)) {
                addFile(text.trim() || href.split("/").pop() || href, href, "link");
            }
        });
        document.querySelectorAll("pre, code, p, li, div").forEach(node => {
            const text = node.textContent || "";
            let match;
            while ((match = filePattern.exec(text))) addFile(match[1], "", "text");
        });
        return Array.from(map.values());
    }

    function showMonkeyDock() {
        if (monkeyDock) return;
        monkeyDock = createEl("button", {
            text: "🐒",
            title: "Open Chad",
            onclick: event => {
                event.preventDefault();
                event.stopPropagation();
                openPanelFromDock();
            },
            style: {
                position: "fixed",
                right: "18px",
                bottom: "18px",
                width: "58px",
                height: "58px",
                borderRadius: "999px",
                border: "2px solid #f59e0b",
                background: "linear-gradient(135deg,#fef3c7,#fed7aa)",
                boxShadow: "0 12px 28px rgba(15,23,42,.28)",
                zIndex: "1000002",
                cursor: "pointer",
                fontSize: "31px",
                lineHeight: "1"
            }
        });
        document.body.appendChild(monkeyDock);
    }

    function removeMonkeyDock() {
        if (!monkeyDock) return;
        monkeyDock.remove();
        monkeyDock = null;
    }

    function openPanelFromDock() {
        if (!panel) return;
        panel.style.display = "flex";
        panel.style.visibility = "visible";
        panel.style.opacity = "1";
        panel.style.pointerEvents = "auto";
        removeMonkeyDock();
    }

    function toggleMonkeyDock() {
        if (!panel) return;
        panel.style.display = "none";
        showMonkeyDock();
    }

    function renderHeader() {
        const state = window.Chad.storage.state;
        const agent = getActiveAgent();
        const tabs = [["Chaties", "chaties"], ["Convo", "convo"], ["Tasks", "tasks"], ["Roadmap", "roadmap"], ["Pins", "pins"], ["Repo", "repo"], ["Notes", "notes"]];
        const header = createEl("div", {
            style: {
                flex: "0 0 auto",
                position: "relative",
                zIndex: "2",
                padding: "9px",
                background: isDoneFlashing() ? "#dcfce7" : "#f1f5f9",
                borderBottom: "1px solid " + (isDoneFlashing() ? "#22c55e" : "#cbd5e1"),
                boxShadow: isDoneFlashing() ? "0 0 0 3px rgba(34,197,94,.25) inset" : "none"
            }
        });
        const top = createEl("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "7px" } });
        top.appendChild(createEl("div", {
            style: { flex: "1 1 auto", minWidth: "0" },
            html: `<div style="font-size:10px;color:#64748b;font-weight:800;line-height:1">Chad</div><div style="font-size:17px;color:#0f172a;font-weight:900;line-height:1.15">${escapeHTML(agent ? agent.icon : "🤖")} ${escapeHTML(agent ? agent.name : "Agent")}</div><div style="font-size:11px;color:#64748b;font-weight:600;max-width:190px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHTML(agent ? agent.description : "")}</div>`
        }));
        top.appendChild(createEl("div", { style: { flex: "0 1 auto", display: "flex", gap: "4px", alignItems: "center", justifyContent: "flex-end", flexWrap: "wrap" } }, [
            button("TASK RULES", () => window.Chad.actions.copyText(getTaskRulesText()), { bg: "#e0f2fe", border: "#7dd3fc", bold: true }),
            button("GOD RULES", () => {
                const text = (window.Chad.data.companionRules || "") + "\n\n\n" + (window.Chad.data.chatRules || "");
                window.Chad.actions.copyText(text);
            }, { bg: "#ede9fe", border: "#c4b5fd", bold: true }),
            button("🎨", () => window.Chad.paint && window.Chad.paint.open(), { bg: "#fef3c7", border: "#fcd34d", bold: true, title: "Quick Sketch" }),
            button("🔄 Update", () => window.Chad.updateChecker && window.Chad.updateChecker.checkForUpdates(true), { bg: "#e0f2fe", border: "#7dd3fc", bold: true, title: "Check Chad update" }),
            button("🐒", () => toggleMonkeyDock(), { bg: "#fef3c7", border: "#fcd34d", bold: true, title: "Dock Chad" }),
            button("✕", () => {
                panel.style.display = "none";
                if (window.Chad.agentFixes && window.Chad.agentFixes.showDock) window.Chad.agentFixes.showDock();
            }, { bg: "#f8fafc", border: "#cbd5e1" })
        ]));
        const tabRow = createEl("div", { style: { display: "flex", gap: "5px", flexWrap: "wrap", alignItems: "center", position: "relative", zIndex: "3" } });
        for (const [label, tab] of tabs) {
            tabRow.appendChild(button(label, () => {
                state.activeTab = tab;
                render();
                if (tab === "repo" && window.Chad.actions && window.Chad.actions.ensureRepoTreeLoaded) window.Chad.actions.ensureRepoTreeLoaded();
            }, { bg: state.activeTab === tab ? "#2563eb" : "#ffffff", color: state.activeTab === tab ? "#ffffff" : "#0f172a", border: state.activeTab === tab ? "#2563eb" : "#cbd5e1", bold: state.activeTab === tab }));
        }
        tabRow.appendChild(button("Scan", () => window.Chad.scanner && window.Chad.scanner.scanTasks && window.Chad.scanner.scanTasks(), { bg: "#dcfce7", border: "#86efac", bold: true }));
        tabRow.appendChild(createEl("span", { id: "gandhi-chad-scan-status", text: "", style: { fontSize: "11px", color: "#64748b", alignSelf: "center" } }));
        header.appendChild(top);
        header.appendChild(tabRow);
        return header;
    }

    function openTextModal(title, text) {
        const bg = createEl("div", { style: { position: "fixed", inset: "0", background: "rgba(15,23,42,.35)", zIndex: "1000000", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: "40px" } });
        const modal = createEl("div", { style: { width: "780px", maxWidth: "94vw", maxHeight: "86vh", background: "#ffffff", color: "#111827", border: "1px solid #cbd5e1", borderRadius: "10px", boxShadow: "0 12px 40px rgba(15,23,42,.25)", overflow: "hidden" } }, [
            createEl("div", { style: { padding: "10px", borderBottom: "1px solid #cbd5e1", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc" } }, [
                createEl("div", { text: title, style: { fontSize: "17px", fontWeight: "800" } }),
                createEl("div", { style: { display: "flex", gap: "5px" } }, [button("COPY", () => window.Chad.actions.copyText(text)), button("✕", () => bg.remove())])
            ]),
            createEl("pre", { text, style: { margin: "0", padding: "14px", overflow: "auto", maxHeight: "72vh", whiteSpace: "pre-wrap", fontFamily: "Consolas, monospace", fontSize: "14px", lineHeight: "1.45", color: "#334155" } })
        ]);
        bg.appendChild(modal);
        document.body.appendChild(bg);
    }

    function createBodyHost() {
        return createEl("div", {
            id: "gandhi-chad-body-host",
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                background: "#ffffff"
            }
        });
    }

    function render() {
        if (!panel) return;
        const state = window.Chad.storage.state;
        applyTabIdentity();
        panel.innerHTML = "";
        panel.appendChild(renderHeader());
        bodyHost = createBodyHost();
        panel.appendChild(bodyHost);

        const renderers = { chaties: window.Chad.uiChaties, convo: window.Chad.uiConvo, tasks: window.Chad.uiTasks, roadmap: window.Chad.uiRoadmap, pins: window.Chad.uiPins, repo: window.Chad.uiRepo, notes: window.Chad.uiNotes };
        const activeRenderer = renderers[state.activeTab] || renderers.chaties || renderers.tasks;
        try {
            body = activeRenderer && activeRenderer.render ? activeRenderer.render() : createEl("div", { text: "Renderer not loaded.", style: bodyStyle() });
        }
        catch (error) {
            body = createEl("div", { text: "Renderer error: " + (error && error.message ? error.message : error), style: bodyStyle() });
        }
        if (body && body.style) {
            body.style.flex = "1 1 auto";
            body.style.minHeight = "0";
        }
        bodyHost.appendChild(body);
    }

    function bindPanelEventShield() {
        if (!panel || panel.dataset.chadShielded === "1") return;
        panel.dataset.chadShielded = "1";
        const stop = event => event.stopPropagation();
        ["mousedown", "mouseup", "click", "dblclick", "pointerdown", "pointerup", "keydown", "keyup", "input", "beforeinput", "focusin", "focusout"].forEach(type => {
            panel.addEventListener(type, stop, false);
        });
    }

    function bindAnswerReset() {
        document.addEventListener("keydown", event => {
            const target = event.target;
            const isPrompt = target && (target.id === "prompt-textarea" || target.closest && target.closest("#prompt-textarea"));
            if (isPrompt && event.key === "Enter" && !event.shiftKey && isDoneFlashing()) setTimeout(resetDoneFlash, 300);
        }, true);
        document.addEventListener("click", event => {
            const btn = event.target && event.target.closest && event.target.closest("button");
            if (!btn || !isDoneFlashing()) return;
            const label = (btn.getAttribute("aria-label") || btn.textContent || "").toLowerCase();
            if (label.includes("send") || label.includes("submit")) setTimeout(resetDoneFlash, 300);
        }, true);
    }

    function autoOpenAfterInitialLayout() {
        if (!panel || didInitialAutoOpen) return;
        didInitialAutoOpen = true;
        void panel.offsetHeight;
        requestAnimationFrame(() => {
            void panel.offsetHeight;
            requestAnimationFrame(() => {
                openPanelFromDock();
            });
        });
    }

    function start() {
        if (document.querySelector("#gandhi-chad-panel")) return;
        window.Chad.storage.state.activeTab = window.Chad.storage.state.activeTab || "chaties";

        showMonkeyDock();

        panel = createEl("div", {
            id: "gandhi-chad-panel",
            style: {
                position: "fixed",
                right: "14px",
                top: "70px",
                bottom: "14px",
                width: "410px",
                background: "#ffffff",
                color: "#111827",
                border: "1px solid #cbd5e1",
                borderRadius: "12px",
                zIndex: "999999",
                fontFamily: "Arial, sans-serif",
                fontSize: "12px",
                boxShadow: "0 10px 35px rgba(15,23,42,.20)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                visibility: "hidden",
                opacity: "0",
                pointerEvents: "none"
            }
        });
        document.body.appendChild(panel);
        bindPanelEventShield();
        bindAnswerReset();
        render();
        autoOpenAfterInitialLayout();
    }

    ui.createEl = createEl;
    ui.escapeHTML = escapeHTML;
    ui.button = button;
    ui.bodyStyle = bodyStyle;
    ui.loadJSON = loadJSON;
    ui.saveJSON = saveJSON;
    ui.currentChatUrl = currentChatUrl;
    ui.normalizeUrl = normalizeUrl;
    ui.nowStamp = nowStamp;
    ui.defaultAgents = defaultAgents;
    ui.migrateOldAgents = migrateOldAgents;
    ui.getAgents = getAgents;
    ui.saveAgents = saveAgents;
    ui.getActiveAgent = getActiveAgent;
    ui.setActiveAgentId = setActiveAgentId;
    ui.isDoneFlashing = isDoneFlashing;
    ui.scrollToLatest = scrollToLatest;
    ui.applyTabIdentity = applyTabIdentity;
    ui.markDoneFlash = markDoneFlash;
    ui.resetDoneFlash = resetDoneFlash;
    ui.scanVisibleChatFiles = scanVisibleChatFiles;
    ui.openTextModal = openTextModal;
    ui.openTaskModal = task => openTextModal(task.id + " — " + task.title, task.prompt);
    ui.toggleMonkeyDock = toggleMonkeyDock;
    ui.render = render;
    ui.start = start;

    window.Chad.ui = ui;
})();
