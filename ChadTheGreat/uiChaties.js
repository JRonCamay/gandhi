window.Chad = window.Chad || {};

(function () {
    "use strict";

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function bodyStyle() { return ui().bodyStyle(); }
    function render() { return ui().render(); }
    function nowStamp() { return ui().nowStamp(); }
    function currentChatUrl() { return ui().currentChatUrl(); }
    function defaultAgents() { return ui().defaultAgents(); }
    function getAgents() { return ui().getAgents(); }
    function saveAgents(agents) { return ui().saveAgents(agents); }
    function getActiveAgentId() { const agent = ui().getActiveAgent(); return agent ? agent.id : ""; }
    function setActiveAgentId(id) { return ui().setActiveAgentId(id); }
    function isDoneFlashing() { return ui().isDoneFlashing(); }
    function scanVisibleChatFiles() { return ui().scanVisibleChatFiles(); }
    function applyTabIdentity() { return ui().applyTabIdentity(); }
    function scrollToLatest() { return ui().scrollToLatest(); }

    function renderAgentFile(agent, file) {
        return el("div", { style: { border: "1px solid #e2e8f0", borderRadius: "7px", padding: "6px", marginTop: "5px", background: "#ffffff" } }, [
            el("div", {
                html: `<b>📄 ${esc(file.name)}</b><br><span style="color:#64748b">${esc(file.source || "chat")} · ${esc(file.addedAt || "")}</span>`,
                style: { fontSize: "11px", lineHeight: "1.35", marginBottom: "5px" }
            }),
            el("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap" } }, [
                file.url ? btn("OPEN", () => window.open(file.url, "_blank")) : null,
                btn("COPY", () => window.Chad.actions.copyText(file.url || file.name)),
                btn("DELETE", () => {
                    agent.files = (agent.files || []).filter(item => item.id !== file.id);
                    saveAgents(getAgents().map(a => a.id === agent.id ? agent : a));
                    render();
                }, { bg: "#fee2e2", border: "#fecaca" })
            ])
        ]);
    }

    function scanFiles(agentId) {
        const list = getAgents();
        const agent = list.find(item => item.id === agentId);
        if (!agent) return;

        const found = scanVisibleChatFiles();
        const map = new Map();
        for (const file of agent.files || []) map.set(String(file.url || file.name || file.id).toLowerCase(), file);
        for (const file of found) {
            const key = String(file.url || file.name || file.id).toLowerCase();
            if (!map.has(key)) map.set(key, file);
        }
        agent.files = Array.from(map.values());
        agent.updatedAt = nowStamp();
        saveAgents(list);
    }

    function openAgent(agent) {
        setActiveAgentId(agent.id);
        applyTabIdentity();
        render();
        if (window.Chad.bridge && window.Chad.bridge.isExtension && window.Chad.bridge.isExtension()) {
            window.Chad.bridge.openAgentTab(agent).catch(() => window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id));
        }
        else {
            window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
        }
        scrollToLatest();
    }

    function editAgent(agentId) {
        const list = getAgents();
        const agent = list.find(item => item.id === agentId);
        if (!agent) return;
        const icon = prompt("Icon", agent.icon || "🤖"); if (icon === null) return;
        const name = prompt("Name", agent.name || "Agent"); if (name === null) return;
        const description = prompt("Description", agent.description || ""); if (description === null) return;
        const chatUrl = prompt("Chat URL", agent.chatUrl || "https://chatgpt.com/"); if (chatUrl === null) return;
        const tabTitle = prompt("Tab title", agent.tabTitle || `${icon} ${name}`); if (tabTitle === null) return;
        Object.assign(agent, { icon: icon.trim() || "🤖", name: name.trim() || "Agent", description: description.trim(), chatUrl: chatUrl.trim() || "https://chatgpt.com/", tabTitle: tabTitle.trim() || `${icon} ${name}`, updatedAt: nowStamp() });
        saveAgents(list);
        setActiveAgentId(agent.id);
        applyTabIdentity();
        render();
    }

    function renderAgentCard(agent, active) {
        const activeDone = active && isDoneFlashing();
        const box = el("div", {
            style: {
                border: "1px solid " + (activeDone ? "#22c55e" : active ? "#2563eb" : "#cbd5e1"),
                borderRadius: "9px",
                padding: "7px",
                marginTop: "6px",
                background: activeDone ? "#dcfce7" : active ? "#eff6ff" : "#f8fafc"
            }
        });

        box.appendChild(el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" } }, [
            btn(`${agent.icon || "🤖"} ${agent.name || "Agent"}`, () => openAgent(agent), { bg: "transparent", border: "transparent", bold: true, padding: "3px", fontSize: "12px" }),
            btn("INFO", () => editAgent(agent.id), { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        box.appendChild(el("div", {
            text: agent.description || "Click INFO to add description.",
            style: { color: agent.description ? "#64748b" : "#94a3b8", fontSize: "11px", marginTop: "3px" }
        }));

        if (active) {
            box.appendChild(el("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" } }, [
                btn("SCAN FILES", () => { scanFiles(agent.id); render(); }, { bg: "#dcfce7", border: "#86efac", bold: true }),
                btn("USE THIS CHAT", () => { agent.chatUrl = currentChatUrl(); agent.updatedAt = nowStamp(); saveAgents(getAgents().map(a => a.id === agent.id ? agent : a)); render(); }, { bg: "#e0f2fe", border: "#7dd3fc" }),
                btn("COPY LINK", () => window.Chad.actions.copyText(agent.chatUrl || "")),
                btn("DELETE AGENT", () => { const next = getAgents().filter(a => a.id !== agent.id); saveAgents(next.length ? next : defaultAgents()); setActiveAgentId((next[0] || defaultAgents()[0]).id); render(); }, { bg: "#fee2e2", border: "#fecaca" })
            ]));

            if (!agent.files || !agent.files.length) {
                box.appendChild(el("div", { text: "No files yet. Click SCAN FILES.", style: { color: "#64748b", fontSize: "11px", padding: "7px 2px 0" } }));
            }
            else {
                for (const file of agent.files) box.appendChild(renderAgentFile(agent, file));
            }
        }

        return box;
    }

    function renderChaties() {
        const wrap = el("div", { style: bodyStyle() });
        const agents = getAgents();
        const activeId = getActiveAgentId();

        wrap.appendChild(el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" } }, [
            el("div", { html: `<b>Chaties</b><br><span style="color:#64748b">Global agents. Opens tabs in the Chaties group.</span>` }),
            btn("+", () => {
                const agent = {
                    id: "agent-" + Date.now(), icon: "🤖", name: "New Agent", description: "",
                    chatUrl: "https://chatgpt.com/", tabTitle: "🤖 New Agent", files: [], createdAt: nowStamp(), updatedAt: nowStamp()
                };
                const list = getAgents();
                list.push(agent);
                saveAgents(list);
                setActiveAgentId(agent.id);
                render();
            }, { bg: "#dcfce7", border: "#86efac", bold: true })
        ]));

        for (const agent of agents) wrap.appendChild(renderAgentCard(agent, agent.id === activeId));
        return wrap;
    }

    window.Chad.uiChaties = { render: renderChaties, scanFiles, openAgent };
})();
