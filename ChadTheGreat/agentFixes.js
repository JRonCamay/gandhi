window.Chad = window.Chad || {};

(function () {
    "use strict";

    const DONE_KEY = "gandhi_chad_task_done_flash_v1";

    let lastChatiesSignature = "";

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

    function btn(label, attrs, bg, border, bold, press) {
        const data = Object.entries(attrs || {}).map(([k, v]) => `data-${k}="${escapeHTML(v)}"`).join(" ");
        return `<button ${data} ${press ? "data-press='1'" : ""} style="background:${bg || "#f8fafc"};border:1px solid ${border || "#cbd5e1"};border-radius:6px;padding:4px 7px;font-size:11px;cursor:pointer;white-space:nowrap;font-weight:${bold ? "700" : "500"};transition:transform .08s ease,filter .08s ease,box-shadow .08s ease">${escapeHTML(label)}</button>`;
    }

    function renderChatiesStable(force) {
        if (window.Chad.uiChaties && window.Chad.uiChaties.renderIntoPanel) {
            window.Chad.uiChaties.renderIntoPanel();
            return;
        }

        const panel = document.querySelector("#gandhi-chad-panel");
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!panel || !state || state.activeTab !== "chaties") return;

        const oldBody = panel.children[1];
        if (!oldBody) return;

        const identity = window.Chad.agentIdentity;
        const filesApi = window.Chad.agentFiles;
        if (!identity || !filesApi) return;

        const agents = identity.getAgents();
        const activeId = identity.getActiveId();
        const doneLive = Number(localStorage.getItem(DONE_KEY) || 0) > Date.now();
        const expandedMap = identity.getExpandedMap();
        const signature = JSON.stringify({
            activeId,
            doneLive,
            expandedMap,
            agents: agents.map(a => [a.id, a.name, a.icon, a.description, a.chatUrl])
        });

        if (!force && oldBody.dataset.chadStable === "1" && signature === lastChatiesSignature) return;
        lastChatiesSignature = signature;

        const body = document.createElement("div");
        body.dataset.chadStable = "1";
        Object.assign(body.style, {
            padding: "8px",
            overflowY: "auto",
            height: "calc(100vh - 158px)",
            background: "#ffffff"
        });

        body.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
                <div><b>Chaties</b><br><span style="color:#64748b">Global agents. Arrow expands info without opening tabs.</span></div>
                ${btn("+", { addagent: "1" }, "#dcfce7", "#86efac", true, true)}
            </div>
            ${agents.map(agent => {
                const active = agent.id === activeId;
                const expanded = identity.isExpanded(agent.id);
                const activeDone = active && doneLive;
                return `
                    <div style="border:1px solid ${activeDone ? "#22c55e" : active ? "#2563eb" : "#cbd5e1"};border-radius:9px;padding:7px;margin-top:6px;background:${activeDone ? "#dcfce7" : active ? "#eff6ff" : "#f8fafc"}">
                        <div style="display:flex;gap:6px;align-items:center">
                            ${btn(expanded ? "▾" : "▸", { toggleagent: agent.id }, "#ffffff", "#cbd5e1", true, false)}
                            <button data-openagent="${escapeHTML(agent.id)}" style="flex:1;text-align:left;background:transparent;border:0;padding:3px;cursor:pointer;color:#0f172a;font-weight:700">
                                ${escapeHTML(agent.icon || "🤖")} ${escapeHTML(agent.name || "Agent")}
                            </button>
                            ${btn("INFO", { editagent: agent.id }, "#fef3c7", "#fcd34d", false, true)}
                        </div>
                        <div style="color:${agent.description ? "#64748b" : "#94a3b8"};font-size:11px;margin-top:3px">${escapeHTML(agent.description || "Click INFO to add description.")}</div>
                        ${expanded ? `
                            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
                                ${btn("SCAN FILES", { scanfiles: agent.id }, "#dcfce7", "#86efac", true, true)}
                                ${btn("USE THIS CHAT", { usechat: agent.id }, "#e0f2fe", "#7dd3fc", false, true)}
                                ${btn("COPY LINK", { copylink: agent.id }, "#f8fafc", "#cbd5e1", false, true)}
                                ${btn("DELETE AGENT", { deleteagent: agent.id }, "#fee2e2", "#fecaca", false, true)}
                            </div>` : ""}
                    </div>`;
            }).join("")}`;

        oldBody.replaceWith(body);
        bindChaties(body);
    }

    function editAgent(agentId) {
        const identity = window.Chad.agentIdentity;
        const agents = identity.getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;
        const icon = prompt("Icon", agent.icon || "🤖"); if (icon === null) return;
        const name = prompt("Name", agent.name || "Agent"); if (name === null) return;
        const description = prompt("Description", agent.description || ""); if (description === null) return;
        const chatUrl = prompt("Chat URL", agent.chatUrl || "https://chatgpt.com/"); if (chatUrl === null) return;
        const tabTitle = prompt("Tab title", agent.tabTitle || `${icon} ${name}`); if (tabTitle === null) return;
        Object.assign(agent, {
            icon: icon.trim() || "🤖",
            name: name.trim() || "Agent",
            description: description.trim(),
            chatUrl: chatUrl.trim() || "https://chatgpt.com/",
            tabTitle: tabTitle.trim() || `${icon} ${name}`,
            updatedAt: nowStamp()
        });
        identity.saveAgents(agents);
    }

    function bindChaties(root) {
        root.addEventListener("click", event => {
            const target = event.target.closest("button");
            if (!target) return;
            const d = target.dataset;
            const identity = window.Chad.agentIdentity;
            const tabs = window.Chad.agentTabs;

            if (d.toggleagent) { identity.toggleExpanded(d.toggleagent); renderChatiesStable(true); return; }
            if (d.openagent) { tabs.openAgent(identity.getAgents().find(a => a.id === d.openagent), renderChatiesStable); return; }
            if (d.editagent) { editAgent(d.editagent); renderChatiesStable(true); return; }
            if (d.scanfiles && window.Chad.agentFiles) { window.Chad.agentFiles.mergeFiles(d.scanfiles); renderChatiesStable(true); return; }
            if (d.usechat) {
                const agents = identity.getAgents();
                const agent = agents.find(a => a.id === d.usechat);
                if (agent) {
                    agent.chatUrl = identity.currentChatUrl();
                    agent.updatedAt = nowStamp();
                    identity.saveAgents(agents);
                    identity.setActiveId(agent.id);
                    if (window.Chad.ui && window.Chad.ui.applyTabIdentity) window.Chad.ui.applyTabIdentity();
                    renderChatiesStable(true);
                }
                return;
            }
            if (d.copylink) {
                const agent = identity.getAgents().find(a => a.id === d.copylink);
                if (agent && window.Chad.actions) window.Chad.actions.copyText(agent.chatUrl || "");
                return;
            }
            if (d.deleteagent) {
                const next = identity.getAgents().filter(a => a.id !== d.deleteagent);
                identity.saveAgents(next);
                if (identity.getActiveId() === d.deleteagent) identity.setActiveId(next[0] ? next[0].id : "");
                renderChatiesStable(true);
            }
        });
    }

    function tick() {
        if (window.Chad.agentIdentity) {
            window.Chad.agentIdentity.syncActiveAgentToCurrentUrl(renderChatiesStable);
        }
        if (window.Chad.chadDock) {
            window.Chad.chadDock.patchCloseButton();
        }
    }

    function start() {
        if (window.Chad.pressFeedback) {
            window.Chad.pressFeedback.addPressFeedback();
        }
        if (window.Chad.chadDock) {
            window.Chad.chadDock.ensureDock(renderChatiesStable);
        }
        setInterval(tick, 600);
        setTimeout(tick, 300);
        setTimeout(tick, 1200);
    }

    window.Chad.agentFixes = {
        renderChatiesStable,
        scrollToEnd() {
            if (window.Chad.agentTabs) window.Chad.agentTabs.scrollToEnd();
        },
        syncActiveAgentToCurrentUrl() {
            if (window.Chad.agentIdentity) {
                window.Chad.agentIdentity.syncActiveAgentToCurrentUrl(renderChatiesStable);
            }
        },
        showDock() {
            if (window.Chad.chadDock) window.Chad.chadDock.showDock();
        }
    };

    start();
})();
