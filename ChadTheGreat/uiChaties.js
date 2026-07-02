window.Chad = window.Chad || {};

(function () {
    "use strict";

    const api = {};
    const DONE_KEY = "gandhi_chad_task_done_flash_v1";

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

    function bodyStyle() {
        return {
            padding: "8px",
            overflowY: "auto",
            height: "calc(100vh - 158px)",
            background: "#ffffff"
        };
    }

    function button(label, fn, extra) {
        if (window.Chad.ui && window.Chad.ui.button) {
            return window.Chad.ui.button(label, fn, extra || {});
        }

        const btn = document.createElement("button");
        btn.textContent = label;
        btn.title = extra && extra.title ? extra.title : "";
        btn.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            fn(event);
        });
        Object.assign(btn.style, {
            background: extra && extra.bg ? extra.bg : "#f8fafc",
            color: extra && extra.color ? extra.color : "#0f172a",
            border: "1px solid " + (extra && extra.border ? extra.border : "#cbd5e1"),
            borderRadius: "6px",
            padding: extra && extra.padding ? extra.padding : "4px 7px",
            fontSize: extra && extra.fontSize ? extra.fontSize : "11px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontWeight: extra && extra.bold ? "700" : "500"
        });
        return btn;
    }

    function createEl(tag, props, children) {
        if (window.Chad.ui && window.Chad.ui.createEl) {
            return window.Chad.ui.createEl(tag, props || {}, children || []);
        }

        const node = document.createElement(tag);
        Object.assign(node, props || {});
        (children || []).forEach(child => child && node.appendChild(child));
        return node;
    }

    function isDoneFlashing() {
        return Date.now() < Number(localStorage.getItem(DONE_KEY) || 0);
    }

    function getDeps() {
        return {
            identity: window.Chad.agentIdentity,
            tabs: window.Chad.agentTabs,
            files: window.Chad.agentFiles
        };
    }

    function renderFile(agent, file) {
        const wrap = createEl("div", {
            style: {
                border: "1px solid #e2e8f0",
                borderRadius: "7px",
                padding: "6px",
                marginTop: "5px",
                background: "#ffffff"
            }
        });

        wrap.appendChild(createEl("div", {
            html: `<b>📄 ${escapeHTML(file.name)}</b><br><span style="color:#64748b">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>`,
            style: { fontSize: "11px", lineHeight: "1.35", marginBottom: "5px" }
        }));

        wrap.appendChild(createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap" } }, [
            file.url ? button("OPEN", () => window.open(file.url, "_blank")) : null,
            button("COPY", () => window.Chad.actions.copyText(file.url || file.name)),
            button("DELETE", () => {
                const identity = window.Chad.agentIdentity;
                const agents = identity.getAgents();
                const current = agents.find(item => item.id === agent.id);
                if (!current) return;
                current.files = (current.files || []).filter(item => item.id !== file.id);
                identity.saveAgents(agents);
                renderIntoPanel();
            }, { bg: "#fee2e2", border: "#fecaca" })
        ]));

        return wrap;
    }

    function editAgent(agentId) {
        const { identity } = getDeps();
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
        const { identity } = getDeps();
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
        const { identity } = getDeps();
        const agents = identity.getAgents().filter(agent => agent.id !== agentId);
        identity.saveAgents(agents);
        if (identity.getActiveId() === agentId) {
            identity.setActiveId(agents[0] ? agents[0].id : "");
        }
        renderIntoPanel();
    }

    function renderAgent(agent) {
        const { identity, tabs, files } = getDeps();
        const active = agent.id === identity.getActiveId();
        const expanded = identity.isExpanded(agent.id);
        const activeDone = active && isDoneFlashing();
        const shownFiles = files.visibleFilesForAgent(agent);

        const box = createEl("div", {
            style: {
                border: "1px solid " + (activeDone ? "#22c55e" : active ? "#2563eb" : "#cbd5e1"),
                borderRadius: "9px",
                padding: "7px",
                marginTop: "6px",
                background: activeDone ? "#dcfce7" : active ? "#eff6ff" : "#f8fafc"
            }
        });

        box.appendChild(createEl("div", { style: { display: "flex", gap: "6px", alignItems: "center" } }, [
            button(expanded ? "▾" : "▸", () => {
                identity.toggleExpanded(agent.id);
                renderIntoPanel();
            }, { bg: "#ffffff", border: "#cbd5e1", bold: true }),
            button(`${agent.icon || "🤖"} ${agent.name || "Agent"}`, () => tabs.openAgent(agent), {
                bg: "transparent", border: "transparent", bold: true, padding: "3px", fontSize: "12px"
            }),
            button("INFO", () => editAgent(agent.id), { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        box.appendChild(createEl("div", {
            text: agent.description || "Click INFO to add description.",
            style: { color: agent.description ? "#64748b" : "#94a3b8", fontSize: "11px", marginTop: "3px" }
        }));

        if (!expanded) return box;

        box.appendChild(createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" } }, [
            button("SCAN FILES", () => { files.mergeFiles(agent.id); renderIntoPanel(); }, { bg: "#dcfce7", border: "#86efac", bold: true }),
            button("USE THIS CHAT", () => {
                const agents = identity.getAgents();
                const current = agents.find(item => item.id === agent.id);
                if (!current) return;
                current.chatUrl = identity.currentChatUrl();
                current.updatedAt = nowStamp();
                identity.saveAgents(agents);
                identity.setActiveId(agent.id);
                renderIntoPanel();
            }, { bg: "#e0f2fe", border: "#7dd3fc" }),
            button("COPY LINK", () => window.Chad.actions.copyText(agent.chatUrl || "")),
            button("DELETE AGENT", () => deleteAgent(agent.id), { bg: "#fee2e2", border: "#fecaca" })
        ]));

        if (!shownFiles.length) {
            box.appendChild(createEl("div", {
                text: "No files yet. Click SCAN FILES.",
                style: { color: "#64748b", fontSize: "11px", padding: "7px 2px 0" }
            }));
        }
        else {
            shownFiles.forEach(file => box.appendChild(renderFile(agent, file)));
        }

        return box;
    }

    function render() {
        const { identity, files } = getDeps();
        const wrap = createEl("div", { style: bodyStyle() });

        if (!identity || !files) {
            wrap.appendChild(createEl("div", { text: "Chaties modules are still loading...", style: { color: "#64748b", padding: "10px" } }));
            return wrap;
        }

        wrap.appendChild(createEl("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" } }, [
            createEl("div", { html: `<b>Chaties</b><br><span style="color:#64748b">Global agents. Opens tabs in the Chaties group.</span>` }),
            button("+", addAgent, { bg: "#dcfce7", border: "#86efac", bold: true })
        ]));

        identity.getAgents().forEach(agent => wrap.appendChild(renderAgent(agent)));
        return wrap;
    }

    function renderIntoPanel() {
        const panel = document.querySelector("#gandhi-chad-panel");
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!panel || !state || state.activeTab !== "chaties") return;

        const oldBody = panel.children[1];
        const newBody = render();
        if (oldBody) oldBody.replaceWith(newBody);
        else panel.appendChild(newBody);
    }

    function patchUiRender() {
        const ui = window.Chad.ui;
        if (!ui || ui.__uiChatiesPatched) return;

        const originalRender = ui.render;
        ui.render = function () {
            originalRender.apply(ui, arguments);
            const state = window.Chad.storage && window.Chad.storage.state;
            if (state && state.activeTab === "chaties") {
                renderIntoPanel();
            }
        };

        ui.__uiChatiesPatched = true;
    }

    function patchAgentFixes() {
        const fixes = window.Chad.agentFixes;
        if (!fixes || fixes.__uiChatiesPatched) return;

        fixes.renderChatiesStable = function () {
            renderIntoPanel();
        };
        fixes.__uiChatiesPatched = true;
    }

    function start() {
        patchUiRender();
        patchAgentFixes();
        setInterval(() => {
            patchUiRender();
            patchAgentFixes();
        }, 500);
    }

    api.render = render;
    api.renderIntoPanel = renderIntoPanel;
    api.patchUiRender = patchUiRender;

    window.Chad.uiChaties = api;
    start();
})();
