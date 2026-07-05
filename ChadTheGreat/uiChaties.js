window.Chad = window.Chad || {};

(function () {
    "use strict";

    function ui() { return window.Chad.ui; }
    function identity() { return window.Chad.agentIdentity; }
    function files() { return window.Chad.agentFiles; }
    function tabs() { return window.Chad.agentTabs; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function bodyStyle() { return ui().bodyStyle(); }
    function render() { return ui().render(); }
    function nowStamp() { return ui().nowStamp(); }
    function currentChatUrl() { return identity() ? identity().currentChatUrl() : ui().currentChatUrl(); }
    function defaultAgents() { return ui().defaultAgents(); }
    function getAgents() { return identity() ? identity().getAgents() : ui().getAgents(); }
    function saveAgents(agents) { return identity() ? identity().saveAgents(agents) : ui().saveAgents(agents); }
    function getActiveAgentId() { return identity() ? identity().getActiveId() : (ui().getActiveAgent() ? ui().getActiveAgent().id : ""); }
    function setActiveAgentId(id) { return identity() ? identity().setActiveId(id) : ui().setActiveAgentId(id); }
    function isDoneFlashing() { return ui().isDoneFlashing(); }
    function applyTabIdentity() { return ui().applyTabIdentity(); }
    function scrollToLatest() { return ui().scrollToLatest(); }

    function isExpanded(agentId) {
        return identity() && identity().isExpanded ? identity().isExpanded(agentId) : false;
    }

    function toggleExpanded(agentId) {
        if (identity() && identity().toggleExpanded) {
            identity().toggleExpanded(agentId);
            render();
        }
    }

    function scanFiles(agentId) {
        if (files() && files().mergeFiles) {
            files().mergeFiles(agentId);
            render();
            return;
        }

        const list = getAgents();
        const agent = list.find(item => item.id === agentId);
        if (!agent) return;
        agent.updatedAt = nowStamp();
        saveAgents(list);
        render();
    }

    function openAgent(agent) {
        setActiveAgentId(agent.id);
        applyTabIdentity();
        render();

        if (tabs() && tabs().openAgent) {
            tabs().openAgent(agent, () => render());
            return;
        }

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

    function deleteAgent(agent) {
        const next = getAgents().filter(item => item.id !== agent.id);
        const fallback = defaultAgents();
        saveAgents(next.length ? next : fallback);
        setActiveAgentId((next[0] || fallback[0]).id);
        render();
    }

    function deleteFile(agent, file) {
        agent.files = (agent.files || []).filter(item => item.id !== file.id);
        saveAgents(getAgents().map(item => item.id === agent.id ? agent : item));
        render();
    }

    function visibleAgentFiles(agent) {
        if (files() && files().visibleFilesForAgent) return files().visibleFilesForAgent(agent);
        if (files() && files().isTextFileCandidate) {
            return (agent.files || []).filter(file => files().isTextFileCandidate(file.name, file.url));
        }
        return agent.files || [];
    }

    function renderAgentFile(agent, file) {
        return el("div", { style: { border: "1px solid #e2e8f0", borderRadius: "7px", padding: "6px", marginTop: "5px", background: "#ffffff" } }, [
            el("div", {
                html: `<b>📄 ${esc(file.name)}</b><br><span style="color:#64748b">${esc(file.source || "chat")} · ${esc(file.addedAt || "")}</span>`,
                style: { fontSize: "11px", lineHeight: "1.35", marginBottom: "5px" }
            }),
            el("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap" } }, [
                file.url ? btn("OPEN", () => window.open(file.url, "_blank")) : null,
                btn("COPY", () => window.Chad.actions.copyText(file.url || file.name)),
                btn("DELETE", () => deleteFile(agent, file), { bg: "#fee2e2", border: "#fecaca" })
            ])
        ]);
    }

    function renderAgentCard(agent, active) {
        const expanded = isExpanded(agent.id);
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

        const collapseButton = btn(expanded ? "▾" : "▸", () => toggleExpanded(agent.id), {
            bg: "#ffffff",
            border: "#cbd5e1",
            bold: true,
            padding: "3px 6px",
            title: expanded ? "Collapse profile" : "Expand profile"
        });

        box.appendChild(el("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" } }, [
            el("div", { style: { display: "flex", alignItems: "center", gap: "5px", minWidth: "0", flex: "1 1 auto" } }, [
                collapseButton,
                btn(`${agent.icon || "🤖"} ${agent.name || "Agent"}`, () => openAgent(agent), { bg: "transparent", border: "transparent", bold: true, padding: "3px", fontSize: "12px" })
            ]),
            btn("INFO", () => editAgent(agent.id), { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        if (!expanded) {
            box.appendChild(el("div", {
                text: agent.description || "Profile closed.",
                style: { color: "#94a3b8", fontSize: "11px", marginTop: "3px", paddingLeft: "28px" }
            }));
            return box;
        }

        box.appendChild(el("div", {
            text: agent.description || "Click INFO to add description.",
            style: { color: agent.description ? "#64748b" : "#94a3b8", fontSize: "11px", marginTop: "3px", paddingLeft: "28px" }
        }));

        box.appendChild(el("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px", paddingLeft: "28px" } }, [
            btn("SCAN FILES", () => scanFiles(agent.id), { bg: "#dcfce7", border: "#86efac", bold: true }),
            btn("USE THIS CHAT", () => { agent.chatUrl = currentChatUrl(); agent.updatedAt = nowStamp(); saveAgents(getAgents().map(item => item.id === agent.id ? agent : item)); render(); }, { bg: "#e0f2fe", border: "#7dd3fc" }),
            btn("COPY LINK", () => window.Chad.actions.copyText(agent.chatUrl || "")),
            btn("DELETE AGENT", () => deleteAgent(agent), { bg: "#fee2e2", border: "#fecaca" })
        ]));

        const agentFiles = visibleAgentFiles(agent);
        if (!agentFiles.length) {
            box.appendChild(el("div", { text: "No text/code files yet. Click SCAN FILES.", style: { color: "#64748b", fontSize: "11px", padding: "7px 2px 0 28px" } }));
        }
        else {
            const filesWrap = el("div", { style: { paddingLeft: "28px" } });
            for (const file of agentFiles) filesWrap.appendChild(renderAgentFile(agent, file));
            box.appendChild(filesWrap);
        }

        return box;
    }

    function renderChaties() {
        const wrapStyle = bodyStyle();
        Object.assign(wrapStyle, {
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            minHeight: "0"
        });

        const wrap = el("div", { style: wrapStyle });
        const agents = getAgents();
        const activeId = getActiveAgentId();

        const header = el("div", { style: { flex: "0 0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" } }, [
            el("div", { html: `<b>Chaties</b><br><span style="color:#64748b">Global agents. Profiles start collapsed.</span>` }),
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
        ]);

        const list = el("div", {
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                overflowY: "auto",
                overflowX: "hidden",
                paddingRight: "6px",
                scrollbarWidth: "thin"
            }
        });

        for (const agent of agents) list.appendChild(renderAgentCard(agent, agent.id === activeId));

        wrap.appendChild(header);
        wrap.appendChild(list);
        return wrap;
    }

    window.Chad.uiChaties = { render: renderChaties, scanFiles, openAgent };
})();
