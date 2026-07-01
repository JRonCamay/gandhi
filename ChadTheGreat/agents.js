window.Chad = window.Chad || {};

(function () {
    "use strict";

    const agentsModule = {};
    const CHATIES_GROUP_NAME = "Chaties";
    let dockButton = null;

    function nowStamp() {
        if (window.Chad.storage && typeof window.Chad.storage.nowStamp === "function") {
            return window.Chad.storage.nowStamp();
        }
        return new Date().toLocaleString();
    }

    function chatKey() {
        return (
            window.Chad.storage &&
            window.Chad.storage.state &&
            window.Chad.storage.state.chatKey
        ) || "path-unknown";
    }

    function storageKey() {
        return "gandhi_chad_agents_v1:" + chatKey();
    }

    function selectedKey() {
        return "gandhi_chad_selected_agent_v1:" + chatKey();
    }

    function expandedKey() {
        return "gandhi_chad_expanded_agent_v1:" + chatKey();
    }

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            if (!raw) return fallback;
            return JSON.parse(raw) || fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function currentChatUrl() {
        return location.href.includes("/c/")
            ? location.href.split("#")[0]
            : "https://chatgpt.com/";
    }

    function defaultAgents() {
        return [
            {
                id: "agent-brenda",
                icon: "👩🏼",
                name: "Brenda",
                description: "Chad architect and developer.",
                chatUrl: currentChatUrl(),
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
                files: [],
                createdAt: nowStamp(),
                updatedAt: nowStamp()
            }
        ];
    }

    function migrateAgents(agents) {
        let changed = false;
        const current = currentChatUrl();

        for (const agent of agents) {
            if (!agent.files) {
                agent.files = [];
                changed = true;
            }

            if (!agent.description && agent.description !== "") {
                agent.description = "";
                changed = true;
            }

            if (
                agent.id === "agent-brenda" &&
                current.includes("/c/") &&
                (!agent.chatUrl || agent.chatUrl === "https://chatgpt.com/")
            ) {
                agent.chatUrl = current;
                agent.updatedAt = nowStamp();
                changed = true;
            }
        }

        if (changed) saveJSON(storageKey(), agents);
        return agents;
    }

    function getAgents() {
        const agents = loadJSON(storageKey(), defaultAgents());
        return Array.isArray(agents) ? migrateAgents(agents) : defaultAgents();
    }

    function saveAgents(agents) {
        saveJSON(storageKey(), agents);
    }

    function getSelectedAgentId() {
        const agents = getAgents();
        const saved = localStorage.getItem(selectedKey());
        if (agents.some(agent => agent.id === saved)) return saved;
        return agents[0] ? agents[0].id : "";
    }

    function setSelectedAgentId(id) {
        localStorage.setItem(selectedKey(), id || "");
    }

    function getExpandedAgentId() {
        return localStorage.getItem(expandedKey()) || "";
    }

    function setExpandedAgentId(id) {
        localStorage.setItem(expandedKey(), id || "");
    }

    function collapseAgents() {
        setExpandedAgentId("");
    }

    function expandSelectedAgent() {
        const id = getSelectedAgentId();
        if (id) setExpandedAgentId(id);
    }

    function toggleAgentCollapse(agentId) {
        setSelectedAgentId(agentId);
        if (getExpandedAgentId() === agentId) collapseAgents();
        else setExpandedAgentId(agentId);
        window.Chad.ui.render();
    }

    function getSelectedAgent() {
        const agents = getAgents();
        const id = getSelectedAgentId();
        return agents.find(agent => agent.id === id) || agents[0] || null;
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function isValidUrl(url) {
        try {
            const parsed = new URL(url);
            return parsed.protocol === "http:" || parsed.protocol === "https:";
        }
        catch {
            return false;
        }
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

    function canUseChromeTabs() {
        return Boolean(
            typeof chrome !== "undefined" &&
            chrome.tabs &&
            chrome.tabGroups &&
            chrome.windows
        );
    }

    function chromeAsync(fn) {
        return new Promise((resolve, reject) => {
            try {
                fn(result => {
                    const error = chrome.runtime && chrome.runtime.lastError;
                    if (error) {
                        reject(new Error(error.message));
                        return;
                    }
                    resolve(result);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }

    async function ensureChatiesGroup(tabId) {
        if (!canUseChromeTabs()) return;

        const groups = await chromeAsync(callback =>
            chrome.tabGroups.query({ title: CHATIES_GROUP_NAME }, callback)
        );
        const group = groups && groups[0];

        if (!group) {
            const groupId = await chromeAsync(callback =>
                chrome.tabs.group({ tabIds: [tabId] }, callback)
            );
            await chromeAsync(callback =>
                chrome.tabGroups.update(groupId, { title: CHATIES_GROUP_NAME, color: "blue" }, callback)
            );
            return;
        }

        await chromeAsync(callback =>
            chrome.tabs.group({ tabIds: [tabId], groupId: group.id }, callback)
        );
    }

    async function openAgentTab(agent) {
        if (!agent || !agent.chatUrl || !isValidUrl(agent.chatUrl)) {
            alert("Set a valid chat link for this agent first.");
            return;
        }

        if (!canUseChromeTabs()) {
            window.open(agent.chatUrl, "chad_agent_" + agent.id);
            return;
        }

        const targetUrl = normalizeUrl(agent.chatUrl);
        const tabs = await chromeAsync(callback => chrome.tabs.query({}, callback));
        const existing = tabs.find(tab => tab.url && normalizeUrl(tab.url) === targetUrl);

        if (existing) {
            await ensureChatiesGroup(existing.id);
            await chromeAsync(callback => chrome.tabs.update(existing.id, { active: true }, callback));
            await chromeAsync(callback => chrome.windows.update(existing.windowId, { focused: true }, callback));
            return;
        }

        const created = await chromeAsync(callback =>
            chrome.tabs.create({ url: agent.chatUrl, active: true }, callback)
        );
        await ensureChatiesGroup(created.id);
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

        const filePattern = /([A-Za-z0-9_./-]+\.(?:js|txt|md|json|css|html|zip|png|jpg|jpeg|webp|svg))/gi;

        document.querySelectorAll("a[href]").forEach(anchor => {
            const href = anchor.href || "";
            const text = anchor.textContent || "";
            if (/github\.com|raw\.githubusercontent\.com|sandbox:|\.js|\.txt|\.zip|\.md|\.json|\.png|\.jpg|\.jpeg|\.webp|\.svg/i.test(href + " " + text)) {
                addFile(text.trim() || href.split("/").pop() || href, href, "link");
            }
        });

        document.querySelectorAll("pre, code, p, li, div").forEach(el => {
            const text = el.textContent || "";
            let match;
            while ((match = filePattern.exec(text))) addFile(match[1], "", "text");
        });

        return Array.from(map.values());
    }

    function mergeFiles(oldFiles, newFiles) {
        const map = new Map();
        for (const file of oldFiles || []) map.set(String(file.url || file.name || file.id).toLowerCase(), file);
        for (const file of newFiles || []) {
            const key = String(file.url || file.name || file.id).toLowerCase();
            if (!map.has(key)) map.set(key, file);
        }
        return Array.from(map.values());
    }

    function saveScannedFilesToSelectedAgent() {
        const agents = getAgents();
        const agent = agents.find(item => item.id === getSelectedAgentId());
        if (!agent) return;
        agent.files = mergeFiles(agent.files || [], scanVisibleChatFiles());
        agent.updatedAt = nowStamp();
        saveAgents(agents);
        window.Chad.ui.render();
    }

    function addAgent() {
        const agents = getAgents();
        const name = prompt("Agent name", "New Agent");
        if (name === null) return;
        const icon = prompt("Agent icon/emoji", "🤖") || "🤖";
        const description = prompt("Description", "") || "";
        const chatUrl = prompt("Agent chat URL", "https://chatgpt.com/") || "https://chatgpt.com/";
        const agent = {
            id: "agent-" + Date.now(),
            icon: icon.trim() || "🤖",
            name: name.trim() || "New Agent",
            description: description.trim(),
            chatUrl: chatUrl.trim(),
            files: [],
            createdAt: nowStamp(),
            updatedAt: nowStamp()
        };
        agents.push(agent);
        saveAgents(agents);
        setSelectedAgentId(agent.id);
        setExpandedAgentId(agent.id);
        window.Chad.ui.render();
    }

    function deleteSelectedAgent() {
        const agents = getAgents();
        const selectedId = getSelectedAgentId();
        const agent = agents.find(item => item.id === selectedId);
        if (!agent) return;
        if (!confirm("Delete agent from Chad only?\n\n" + agent.name)) return;
        const nextAgents = agents.filter(item => item.id !== selectedId);
        const finalAgents = nextAgents.length ? nextAgents : defaultAgents();
        saveAgents(finalAgents);
        setSelectedAgentId(finalAgents[0].id);
        collapseAgents();
        window.Chad.ui.render();
    }

    function editDescription(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;
        const description = prompt("Description", agent.description || "");
        if (description === null) return;
        agent.description = description.trim();
        agent.updatedAt = nowStamp();
        saveAgents(agents);
        window.Chad.ui.render();
    }

    function editAgent(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;
        const icon = prompt("Icon/emoji", agent.icon || "🤖");
        if (icon === null) return;
        const name = prompt("Name", agent.name || "Agent");
        if (name === null) return;
        const description = prompt("Description", agent.description || "");
        if (description === null) return;
        const chatUrl = prompt("Chat URL", agent.chatUrl || "https://chatgpt.com/");
        if (chatUrl === null) return;
        agent.icon = icon.trim() || "🤖";
        agent.name = name.trim() || "Agent";
        agent.description = description.trim();
        agent.chatUrl = chatUrl.trim();
        agent.updatedAt = nowStamp();
        saveAgents(agents);
        window.Chad.ui.render();
    }

    function useCurrentChatForAgent(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;
        if (!location.href.includes("/c/")) {
            alert("Open the target ChatGPT conversation first.");
            return;
        }
        agent.chatUrl = currentChatUrl();
        agent.updatedAt = nowStamp();
        saveAgents(agents);
        window.Chad.ui.render();
    }

    function removeFile(agentId, fileId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;
        agent.files = (agent.files || []).filter(file => file.id !== fileId);
        agent.updatedAt = nowStamp();
        saveAgents(agents);
        window.Chad.ui.render();
    }

    function renderAgentFile(agent, file) {
        const createEl = window.Chad.ui.createEl;
        const button = window.Chad.ui.button;
        return createEl("div", { style: { border: "1px solid #e2e8f0", borderRadius: "7px", padding: "6px", marginTop: "5px", background: "#ffffff" } }, [
            createEl("div", {
                html: `<b>📄 ${escapeHTML(file.name)}</b><br>` + `<span style=\"color:#64748b\">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>`,
                style: { fontSize: "11px", lineHeight: "1.35", marginBottom: "5px" }
            }),
            createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap" } }, [
                file.url ? button("OPEN", () => window.open(file.url, "_blank")) : null,
                button("COPY", () => window.Chad.actions.copyText(file.url || file.name)),
                button("DELETE", () => removeFile(agent.id, file.id), { bg: "#fee2e2", border: "#fecaca" })
            ])
        ]);
    }

    function renderAgent(agent) {
        const createEl = window.Chad.ui.createEl;
        const button = window.Chad.ui.button;
        const selected = agent.id === getSelectedAgentId();
        const expanded = selected && agent.id === getExpandedAgentId();
        const box = createEl("div", { style: { border: "1px solid " + (selected ? "#2563eb" : "#cbd5e1"), borderRadius: "9px", padding: "7px", marginTop: "6px", background: selected ? "#eff6ff" : "#f8fafc" } });

        box.appendChild(createEl("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" } }, [
            createEl("button", {
                text: expanded ? "▾" : "▸",
                title: expanded ? "Collapse" : "Expand",
                style: { width: "24px", height: "24px", border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", cursor: "pointer", color: "#0f172a" },
                onclick: event => { event.preventDefault(); event.stopPropagation(); toggleAgentCollapse(agent.id); }
            }),
            createEl("button", {
                html: `${escapeHTML(agent.icon || "🤖")} <b>${escapeHTML(agent.name || "Agent")}</b>`,
                title: agent.description || "",
                style: { flex: "1", textAlign: "left", background: "transparent", border: "0", padding: "3px", cursor: "pointer", color: "#0f172a" },
                onclick: () => {
                    setSelectedAgentId(agent.id);
                    setExpandedAgentId(agent.id);
                    window.Chad.ui.render();
                    openAgentTab(agent).catch(error => alert("Could not open agent tab.\n\n" + error.message));
                }
            }),
            button("INFO", () => editAgent(agent.id), { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        box.appendChild(createEl("div", {
            text: agent.description || "Click DESC to add description.",
            title: "Double-click to edit description",
            style: { color: agent.description ? "#64748b" : "#94a3b8", fontSize: "11px", marginTop: "3px", cursor: "pointer" },
            ondblclick: () => editDescription(agent.id)
        }));

        if (selected && !expanded) {
            box.appendChild(createEl("div", { text: "Selected. Click agent name to open chat. Click arrow to expand only.", style: { color: "#64748b", fontSize: "11px", padding: "5px 2px 0" } }));
        }

        if (expanded) {
            box.appendChild(createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" } }, [
                button("SCAN FILES", saveScannedFilesToSelectedAgent, { bg: "#dcfce7", border: "#86efac", bold: true }),
                button("COLLAPSE", () => { collapseAgents(); window.Chad.ui.render(); }),
                button("DESC", () => editDescription(agent.id), { bg: "#ede9fe", border: "#c4b5fd" }),
                button("USE THIS CHAT", () => useCurrentChatForAgent(agent.id), { bg: "#e0f2fe", border: "#7dd3fc" }),
                button("COPY LINK", () => window.Chad.actions.copyText(agent.chatUrl || "")),
                button("DELETE AGENT", deleteSelectedAgent, { bg: "#fee2e2", border: "#fecaca" })
            ]));

            const files = agent.files || [];
            if (!files.length) {
                box.appendChild(createEl("div", { text: "No files yet. Click SCAN FILES while this chat is visible.", style: { color: "#64748b", fontSize: "11px", padding: "7px 2px 0" } }));
            }
            else {
                for (const file of files) box.appendChild(renderAgentFile(agent, file));
            }
        }

        return box;
    }

    function renderChatiesBody() {
        expandSelectedAgent();
        const createEl = window.Chad.ui.createEl;
        const button = window.Chad.ui.button;
        const body = createEl("div", { style: { padding: "8px", overflowY: "auto", height: "calc(100vh - 158px)", background: "#ffffff" } });
        body.appendChild(createEl("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" } }, [
            createEl("div", {
                html: "<b>Chaties</b><br>" + `<span style=\"color:#64748b\">${canUseChromeTabs() ? "Uses Chrome tab group: Chaties." : "Userscript mode: named tabs only. Tab group needs extension mode."}</span>`,
                style: { lineHeight: "1.35" }
            }),
            createEl("div", { style: { display: "flex", gap: "4px" } }, [
                button("+", addAgent, { bg: "#dcfce7", border: "#86efac", bold: true, title: "Add agent" })
            ])
        ]));
        for (const agent of getAgents()) body.appendChild(renderAgent(agent));
        return body;
    }

    function ensureDockButton() {
        if (dockButton) return dockButton;
        dockButton = document.createElement("button");
        dockButton.id = "gandhi-chad-dock-button";
        dockButton.textContent = "😎";
        dockButton.title = "Open Chad";
        Object.assign(dockButton.style, { position: "fixed", right: "18px", bottom: "18px", width: "46px", height: "46px", borderRadius: "50%", border: "1px solid #94a3b8", background: "#0f172a", color: "#ffffff", fontSize: "24px", cursor: "pointer", zIndex: "999999", boxShadow: "0 8px 22px rgba(15,23,42,.28)" });
        dockButton.addEventListener("click", () => {
            const panel = document.querySelector("#gandhi-chad-panel");
            if (panel) panel.style.display = "block";
            dockButton.style.display = "none";
        });
        document.body.appendChild(dockButton);
        return dockButton;
    }

    function dockPanel() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (panel) panel.style.display = "none";
        ensureDockButton().style.display = "block";
    }

    function replaceCloseAndMinimizeButtons() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;
        const buttons = Array.from(panel.querySelectorAll("button"));
        const closeButton = buttons.find(btn => btn.textContent.trim() === "✕");
        const minimizeButton = buttons.find(btn => btn.textContent.trim() === "—" || btn.textContent.trim() === "□");

        if (closeButton && !closeButton.dataset.chadDockPatched) {
            const replacement = closeButton.cloneNode(true);
            replacement.dataset.chadDockPatched = "1";
            replacement.textContent = "✕";
            replacement.title = "Dock Chad";
            replacement.addEventListener("click", event => { event.preventDefault(); event.stopPropagation(); dockPanel(); });
            closeButton.replaceWith(replacement);
        }

        if (minimizeButton && !minimizeButton.dataset.chadDrawPatched) {
            const replacement = minimizeButton.cloneNode(true);
            replacement.dataset.chadDrawPatched = "1";
            replacement.textContent = "🎨";
            replacement.title = "Open Quick Sketch";
            replacement.replaceWith(replacement);
        }
    }

    function unifyRulesButton() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || panel.querySelector("#gandhi-chad-god-rules")) return;
        const buttons = Array.from(panel.querySelectorAll("button"));
        const rulesButton = buttons.find(btn => btn.textContent.trim() === "RULES");
        const chatRulesButton = buttons.find(btn => btn.textContent.trim() === "CHAT RULES");
        if (!rulesButton || !chatRulesButton || !rulesButton.parentElement) return;
        const godButton = window.Chad.ui.button("GOD RULES", () => {
            const text = (window.Chad.data.companionRules || "") + "\n\n\n" + (window.Chad.data.chatRules || "");
            window.Chad.actions.copyText(text);
            alert("God Rules copied.");
        }, { bg: "#ede9fe", border: "#c4b5fd", bold: true });
        godButton.id = "gandhi-chad-god-rules";
        rulesButton.parentElement.insertBefore(godButton, rulesButton);
        rulesButton.remove();
        chatRulesButton.remove();
    }

    function injectChatiesTabButton() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || panel.querySelector("#gandhi-chad-chaties-tab")) return;
        const scanButton = Array.from(panel.querySelectorAll("button")).find(btn => btn.textContent.trim() === "Scan");
        if (!scanButton || !scanButton.parentElement) return;
        const state = window.Chad.storage.state;
        const buttonEl = window.Chad.ui.button("Chaties", () => {
            state.activeTab = "chaties";
            expandSelectedAgent();
            window.Chad.ui.render();
        }, {
            bg: state.activeTab === "chaties" ? "#2563eb" : "#ffffff",
            color: state.activeTab === "chaties" ? "#ffffff" : "#0f172a",
            border: state.activeTab === "chaties" ? "#2563eb" : "#cbd5e1",
            bold: state.activeTab === "chaties"
        });
        buttonEl.id = "gandhi-chad-chaties-tab";
        scanButton.parentElement.insertBefore(buttonEl, scanButton.parentElement.firstChild);
    }

    function renderAgentHeader() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;
        const header = panel.firstElementChild;
        if (!header || !header.firstElementChild) return;
        const title = header.firstElementChild.firstElementChild;
        if (!title || title.dataset.chadAgentHeaderPatched === "1") return;
        const agent = getSelectedAgent();
        title.dataset.chadAgentHeaderPatched = "1";
        title.innerHTML =
            `<div style=\"font-size:10px;color:#64748b;font-weight:800;line-height:1\">Chad</div>` +
            `<div style=\"font-size:17px;color:#0f172a;font-weight:900;line-height:1.15\">${escapeHTML(agent ? agent.icon : "🤖")} ${escapeHTML(agent ? agent.name : "Agent")}</div>` +
            `<div style=\"font-size:11px;color:#64748b;font-weight:600;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis\">${escapeHTML(agent ? agent.description : "")}</div>`;
    }

    function postProcessUI() {
        unifyRulesButton();
        replaceCloseAndMinimizeButtons();
        injectChatiesTabButton();
        renderAgentHeader();

        const state = window.Chad.storage.state;
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || state.activeTab !== "chaties") return;
        expandSelectedAgent();
        if (!panel.querySelector("#gandhi-chad-chaties-body")) {
            const body = renderChatiesBody();
            body.id = "gandhi-chad-chaties-body";
            panel.appendChild(body);
        }
    }

    function patchUI() {
        if (!window.Chad.ui || window.Chad.ui.__agentsPatched) return;
        const originalRender = window.Chad.ui.render;
        window.Chad.ui.render = function () {
            originalRender.apply(window.Chad.ui, arguments);
            postProcessUI();
        };
        window.Chad.ui.__agentsPatched = true;
    }

    agentsModule.getAgents = getAgents;
    agentsModule.saveAgents = saveAgents;
    agentsModule.getSelectedAgent = getSelectedAgent;
    agentsModule.scanVisibleChatFiles = scanVisibleChatFiles;
    agentsModule.saveScannedFilesToSelectedAgent = saveScannedFilesToSelectedAgent;
    agentsModule.openAgentTab = openAgentTab;
    agentsModule.ensureChatiesGroup = ensureChatiesGroup;
    agentsModule.renderChatiesBody = renderChatiesBody;
    agentsModule.collapseAgents = collapseAgents;
    agentsModule.expandSelectedAgent = expandSelectedAgent;
    agentsModule.patchUI = patchUI;

    window.Chad.agents = agentsModule;
    patchUI();
})();
