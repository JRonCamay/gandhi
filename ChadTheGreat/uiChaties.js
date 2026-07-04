window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "uiChaties";
    const api = {};
    const DONE_KEY = "gandhi_chad_task_done_flash_v1";
    const EXPANDED_KEY = "gandhi_chad_expanded_agent_v3";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "uiChaties.js",
        creator: "Manuel",
        purpose: "Current Chaties renderer and panel runtime",
        timestamp: 260703,
        parent: "ChadTheGreat",
        on: true
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    let visibleFilesByAgent = {};

    function nowStamp() {
        return new Date().toLocaleString();
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function createEl(tag, props, children) {
        if (window.Chad.ui && window.Chad.ui.createEl) {
            return window.Chad.ui.createEl(tag, props || {}, children || []);
        }

        const node = document.createElement(tag);
        for (const key in props || {}) {
            if (key === "style") Object.assign(node.style, props[key]);
            else if (key === "text") node.textContent = props[key];
            else if (key === "html") node.innerHTML = props[key];
            else node.setAttribute(key, props[key]);
        }
        (children || []).forEach(child => child && node.appendChild(child));
        return node;
    }

    function button(label, fn, extra) {
        const btn = createEl("button", {
            text: label,
            title: extra && extra.title ? extra.title : "",
            style: {
                background: extra && extra.bg ? extra.bg : "#f8fafc",
                color: extra && extra.color ? extra.color : "#0f172a",
                border: "1px solid " + (extra && extra.border ? extra.border : "#cbd5e1"),
                borderRadius: "6px",
                padding: extra && extra.padding ? extra.padding : "4px 7px",
                fontSize: extra && extra.fontSize ? extra.fontSize : "11px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: extra && extra.bold ? "700" : "500",
                lineHeight: "1.1"
            }
        });

        btn.addEventListener("click", event => {
            if (!isModuleOn()) return;
            event.preventDefault();
            event.stopPropagation();
            fn(event);
        });

        return btn;
    }

    function bodyStyle() {
        return {
            padding: "8px",
            overflowY: "auto",
            height: "calc(100vh - 158px)",
            background: "#ffffff"
        };
    }

    function deps() {
        return {
            identity: window.Chad.agentIdentity,
            tabs: window.Chad.agentTabs,
            files: window.Chad.agentFiles
        };
    }

    function isDoneFlashing() {
        return Date.now() < Number(localStorage.getItem(DONE_KEY) || 0);
    }

    function closeAllAgents() {
        if (!isModuleOn()) return;

        visibleFilesByAgent = {};
        localStorage.setItem(EXPANDED_KEY, "{}");
        if (window.Chad.agentIdentity && window.Chad.agentIdentity.setExpandedMap) {
            window.Chad.agentIdentity.setExpandedMap({});
        }
    }

    function isPanelInput(target) {
        if (!target || !target.closest) return false;
        return !!target.closest("input, textarea, select, [contenteditable='true'], [role='textbox'], .ProseMirror");
    }

    function refocusPanelInput(target) {
        if (!target || typeof target.focus !== "function") return;
        setTimeout(() => {
            try {
                target.focus({ preventScroll: true });
            }
            catch {
                try { target.focus(); }
                catch {}
            }
        }, 0);
    }

    function installPanelFocusGuard() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || panel.__chadPanelFocusGuard) return;

        const protect = event => {
            if (!isModuleOn()) return;
            const target = event.target;
            if (!target || !panel.contains(target) || !isPanelInput(target)) return;
            event.stopPropagation();
            refocusPanelInput(target.closest("input, textarea, select, [contenteditable='true'], [role='textbox'], .ProseMirror") || target);
        };

        ["mousedown", "mouseup", "click", "focusin", "keydown", "keyup", "input"].forEach(type => {
            panel.addEventListener(type, protect, false);
        });

        panel.__chadPanelFocusGuard = true;
    }

    function renderFile(agent, file) {
        const card = createEl("div", {
            style: {
                border: "1px solid #e2e8f0",
                borderRadius: "7px",
                padding: "6px",
                marginTop: "5px",
                background: "#ffffff"
            }
        });

        card.appendChild(createEl("div", {
            html: `<b>📄 ${escapeHTML(file.name)}</b><br><span style="color:#64748b">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>`,
            style: { fontSize: "11px", lineHeight: "1.35", marginBottom: "5px" }
        }));

        card.appendChild(createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap" } }, [
            file.url ? button("OPEN", () => window.open(file.url, "_blank")) : null,
            button("COPY", () => window.Chad.actions.copyText(file.url || file.name)),
            button("CLEAR", () => {
                visibleFilesByAgent[agent.id] = (visibleFilesByAgent[agent.id] || []).filter(item => item.id !== file.id);
                renderIntoPanel();
            }, { bg: "#fee2e2", border: "#fecaca" })
        ]));

        return card;
    }

    function editAgent(agentId) {
        const identity = deps().identity;
        const agents = identity.getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;

        const icon = prompt("Icon", agent.icon || "🤖");
        if (icon === null) return;
        const name = prompt("Name", agent.name || "Agent");
        if (name === null) return;
        const description = prompt("Description", agent.description || "");
        if (description === null) return;
        const chatUrl = prompt("Chat URL", agent.chatUrl || "https://chatgpt.com/");
        if (chatUrl === null) return;
        const tabTitle = prompt("Tab title", agent.tabTitle || `${icon} ${name}`);
        if (tabTitle === null) return;

        Object.assign(agent, {
            icon: icon.trim() || "🤖",
            name: name.trim() || "Agent",
            description: description.trim(),
            chatUrl: chatUrl.trim() || "https://chatgpt.com/",
            tabTitle: tabTitle.trim() || `${icon} ${name}`,
            updatedAt: nowStamp()
        });
        identity.saveAgents(agents);
        renderIntoPanel();
    }

    function addAgent() {
        const identity = deps().identity;
        const agents = identity.getAgents();
        const agent = {
            id: "agent-" + Date.now(),
            icon: "🤖",
            name: "New Agent",
            description: "",
            chatUrl: "https://chatgpt.com/",
            tabTitle: "🤖 New Agent",
            files: [],
            createdAt: nowStamp(),
            updatedAt: nowStamp()
        };

        agents.push(agent);
        identity.saveAgents(agents);
        identity.setActiveId(agent.id);
        identity.setExpanded(agent.id, false);
        renderIntoPanel();
    }

    function deleteAgent(agentId) {
        const identity = deps().identity;
        const agents = identity.getAgents().filter(agent => agent.id !== agentId);
        identity.saveAgents(agents);
        delete visibleFilesByAgent[agentId];
        if (identity.getActiveId() === agentId) identity.setActiveId(agents[0] ? agents[0].id : "");
        renderIntoPanel();
    }

    function scanFilesForAgent(agent) {
        const files = deps().files;
        visibleFilesByAgent[agent.id] = files.scanVisibleChatFiles(agent);
        renderIntoPanel();
    }

    function useThisChat(agent) {
        const identity = deps().identity;
        const agents = identity.getAgents();
        const current = agents.find(item => item.id === agent.id);
        if (!current) return;
        current.chatUrl = identity.currentChatUrl();
        current.updatedAt = nowStamp();
        identity.saveAgents(agents);
        identity.setActiveId(agent.id);
        visibleFilesByAgent = {};
        renderIntoPanel();
    }

    function renderAgentDetails(agent) {
        const files = visibleFilesByAgent[agent.id] || [];
        const detail = createEl("div", { style: { marginTop: "6px" } });

        detail.appendChild(createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap" } }, [
            button("SCAN FILES", () => scanFilesForAgent(agent), { bg: "#dcfce7", border: "#86efac", bold: true }),
            button("USE THIS CHAT", () => useThisChat(agent), { bg: "#e0f2fe", border: "#7dd3fc" }),
            button("COPY LINK", () => window.Chad.actions.copyText(agent.chatUrl || "")),
            button("DELETE AGENT", () => deleteAgent(agent.id), { bg: "#fee2e2", border: "#fecaca" })
        ]));

        if (!files.length) {
            detail.appendChild(createEl("div", {
                text: "No file data loaded. Click SCAN FILES.",
                style: { color: "#64748b", fontSize: "11px", padding: "7px 2px 0" }
            }));
        }
        else {
            files.forEach(file => detail.appendChild(renderFile(agent, file)));
        }

        return detail;
    }

    function renderAgent(agent) {
        const { identity, tabs } = deps();
        const active = agent.id === identity.getActiveId();
        const expanded = identity.isExpanded(agent.id) === true;
        const activeDone = active && isDoneFlashing();

        const box = createEl("div", {
            style: {
                border: "1px solid " + (activeDone ? "#22c55e" : active ? "#2563eb" : "#cbd5e1"),
                borderRadius: "9px",
                padding: "7px",
                marginTop: "6px",
                background: activeDone ? "#dcfce7" : active ? "#eff6ff" : "#f8fafc"
            }
        });

        const arrow = button(expanded ? "▾" : "▸", () => {
            const next = !identity.isExpanded(agent.id);
            identity.setExpanded(agent.id, next);
            if (!next) delete visibleFilesByAgent[agent.id];
            renderIntoPanel();
        }, { bg: "#ffffff", border: "#cbd5e1", bold: true, padding: "4px 6px", title: expanded ? "Collapse" : "Expand" });

        const icon = createEl("span", {
            text: agent.icon || "🤖",
            style: { fontSize: "17px", lineHeight: "1", flex: "0 0 auto" }
        });

        const name = button(agent.name || "Agent", () => tabs.openAgent(agent), {
            bg: "transparent",
            border: "transparent",
            bold: true,
            padding: "3px",
            fontSize: "12px",
            title: "Open agent chat"
        });
        name.style.flex = "1";
        name.style.textAlign = "left";

        box.appendChild(createEl("div", { style: { display: "flex", gap: "6px", alignItems: "center" } }, [
            arrow,
            icon,
            name,
            button("INFO", () => editAgent(agent.id), { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        box.appendChild(createEl("div", {
            text: agent.description || "Click INFO to add description.",
            style: { color: agent.description ? "#64748b" : "#94a3b8", fontSize: "11px", marginTop: "3px", paddingLeft: "34px" }
        }));

        if (expanded) box.appendChild(renderAgentDetails(agent));
        return box;
    }

    function render() {
        if (!isModuleOn()) return null;

        const { identity, files } = deps();
        const wrap = createEl("div", { style: bodyStyle() });

        if (!identity || !files) {
            wrap.appendChild(createEl("div", { text: "Chaties modules are still loading...", style: { color: "#64748b", padding: "10px" } }));
            return wrap;
        }

        wrap.appendChild(createEl("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" } }, [
            createEl("div", { html: `<b>Chaties</b><br><span style="color:#64748b">Agents are closed by default. Click ▸ to open profile.</span>` }),
            button("+", addAgent, { bg: "#dcfce7", border: "#86efac", bold: true })
        ]));

        identity.getAgents().forEach(agent => wrap.appendChild(renderAgent(agent)));
        return wrap;
    }

    function renderIntoPanel() {
        if (!isModuleOn()) return;
        installPanelFocusGuard();
        if (window.Chad.ui && window.Chad.ui.render && !window.Chad.__uiChatiesMainRenderActive) {
            window.Chad.__uiChatiesMainRenderActive = true;
            try {
                window.Chad.ui.render();
            }
            finally {
                window.Chad.__uiChatiesMainRenderActive = false;
            }
        }
    }

    function patchUiRender() {
        if (!isModuleOn()) return;
        installPanelFocusGuard();
    }

    function patchAgentFixes() {
        if (!isModuleOn()) return;

        const fixes = window.Chad.agentFixes;
        if (!fixes || fixes.__uiChatiesSingleRendererPatched) return;
        fixes.renderChatiesStable = function () {
            renderIntoPanel();
        };
        fixes.__uiChatiesSingleRendererPatched = true;
    }

    function start() {
        closeAllAgents();
        patchUiRender();
        patchAgentFixes();
        setInterval(() => {
            if (!isModuleOn()) return;
            patchUiRender();
            patchAgentFixes();
        }, 500);
    }

    api.render = render;
    api.renderIntoPanel = renderIntoPanel;
    api.closeAllAgents = closeAllAgents;
    api.clearVisibleFileData = function () { visibleFilesByAgent = {}; };

    window.Chad.uiChaties = api;
    start();
})();