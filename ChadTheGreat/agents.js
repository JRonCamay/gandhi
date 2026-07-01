window.Chad = window.Chad || {};

(function () {
    "use strict";

    const agentsModule = {};
    const CHATIES_GROUP_NAME = "Chaties";

    function nowStamp() {
        if (
            window.Chad.storage &&
            typeof window.Chad.storage.nowStamp === "function"
        ) {
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

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);

            if (!raw) {
                return fallback;
            }

            return JSON.parse(raw) || fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    }

    function defaultAgents() {
        return [
            {
                id: "agent-brenda",
                icon: "👩🏼",
                name: "Brenda",
                description: "Chad architect and developer.",
                chatUrl: location.href.includes("/c/")
                    ? location.href
                    : "https://chatgpt.com/",
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

    function getAgents() {
        const agents = loadJSON(
            storageKey(),
            defaultAgents()
        );

        return Array.isArray(agents)
            ? agents
            : defaultAgents();
    }

    function saveAgents(agents) {
        saveJSON(storageKey(), agents);
    }

    function getSelectedAgentId() {
        const agents = getAgents();
        const saved = localStorage.getItem(selectedKey());

        if (agents.some(agent => agent.id === saved)) {
            return saved;
        }

        return agents[0] ? agents[0].id : "";
    }

    function setSelectedAgentId(id) {
        localStorage.setItem(selectedKey(), id || "");
    }

    function getSelectedAgent() {
        const agents = getAgents();
        const selectedId = getSelectedAgentId();

        return agents.find(agent => agent.id === selectedId) || agents[0] || null;
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
        if (!canUseChromeTabs()) {
            return;
        }

        const groups = await chromeAsync(callback =>
            chrome.tabGroups.query(
                { title: CHATIES_GROUP_NAME },
                callback
            )
        );

        let group = groups && groups[0];

        if (!group) {
            const groupId = await chromeAsync(callback =>
                chrome.tabs.group(
                    { tabIds: [tabId] },
                    callback
                )
            );

            await chromeAsync(callback =>
                chrome.tabGroups.update(
                    groupId,
                    {
                        title: CHATIES_GROUP_NAME,
                        color: "blue"
                    },
                    callback
                )
            );

            return;
        }

        await chromeAsync(callback =>
            chrome.tabs.group(
                {
                    tabIds: [tabId],
                    groupId: group.id
                },
                callback
            )
        );
    }

    async function openAgentTab(agent) {
        if (!agent || !agent.chatUrl || !isValidUrl(agent.chatUrl)) {
            alert("Set a valid chat link for this agent first.");
            return;
        }

        if (!canUseChromeTabs()) {
            window.open(agent.chatUrl, "_blank");
            return;
        }

        const tabs = await chromeAsync(callback =>
            chrome.tabs.query({}, callback)
        );

        const exact = tabs.find(tab =>
            tab.url && tab.url.split("#")[0] === agent.chatUrl.split("#")[0]
        );

        if (exact) {
            await ensureChatiesGroup(exact.id);
            await chromeAsync(callback =>
                chrome.tabs.update(
                    exact.id,
                    { active: true },
                    callback
                )
            );
            await chromeAsync(callback =>
                chrome.windows.update(
                    exact.windowId,
                    { focused: true },
                    callback
                )
            );
            return;
        }

        const created = await chromeAsync(callback =>
            chrome.tabs.create(
                { url: agent.chatUrl, active: true },
                callback
            )
        );

        await ensureChatiesGroup(created.id);
    }

    function scanVisibleChatFiles() {
        const map = new Map();

        function addFile(name, url, source) {
            const cleanName = String(name || "").trim();
            const cleanUrl = String(url || "").trim();

            if (!cleanName && !cleanUrl) {
                return;
            }

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

            if (
                /github\.com|raw\.githubusercontent\.com|sandbox:|\.js|\.txt|\.zip|\.md|\.json|\.png|\.jpg|\.jpeg|\.webp|\.svg/i.test(href + " " + text)
            ) {
                const label = text.trim() || href.split("/").pop() || href;
                addFile(label, href, "link");
            }
        });

        document.querySelectorAll("pre, code, p, li, div").forEach(el => {
            const text = el.textContent || "";
            let match;

            while ((match = filePattern.exec(text))) {
                addFile(match[1], "", "text");
            }
        });

        return Array.from(map.values());
    }

    function mergeFiles(oldFiles, newFiles) {
        const map = new Map();

        for (const file of oldFiles || []) {
            map.set(
                String(file.url || file.name || file.id).toLowerCase(),
                file
            );
        }

        for (const file of newFiles || []) {
            const key = String(file.url || file.name || file.id).toLowerCase();

            if (!map.has(key)) {
                map.set(key, file);
            }
        }

        return Array.from(map.values());
    }

    function saveScannedFilesToSelectedAgent() {
        const agents = getAgents();
        const selectedId = getSelectedAgentId();
        const agent = agents.find(item => item.id === selectedId);

        if (!agent) {
            return;
        }

        const found = scanVisibleChatFiles();
        agent.files = mergeFiles(agent.files || [], found);
        agent.updatedAt = nowStamp();
        saveAgents(agents);

        if (window.Chad.ui && window.Chad.ui.render) {
            window.Chad.ui.render();
        }
    }

    function addAgent() {
        const agents = getAgents();
        const name = prompt("Agent name", "New Agent");

        if (name === null) {
            return;
        }

        const icon = prompt("Agent icon/emoji", "🤖") || "🤖";
        const chatUrl = prompt("Agent chat URL", "https://chatgpt.com/") || "https://chatgpt.com/";

        const agent = {
            id: "agent-" + Date.now(),
            icon: icon.trim() || "🤖",
            name: name.trim() || "New Agent",
            description: "",
            chatUrl: chatUrl.trim(),
            files: [],
            createdAt: nowStamp(),
            updatedAt: nowStamp()
        };

        agents.push(agent);
        saveAgents(agents);
        setSelectedAgentId(agent.id);
        window.Chad.ui.render();
    }

    function deleteSelectedAgent() {
        const agents = getAgents();
        const selectedId = getSelectedAgentId();
        const agent = agents.find(item => item.id === selectedId);

        if (!agent) {
            return;
        }

        if (!confirm("Delete agent from Chad only?\n\n" + agent.name)) {
            return;
        }

        const nextAgents = agents.filter(item => item.id !== selectedId);
        saveAgents(nextAgents.length ? nextAgents : defaultAgents());
        setSelectedAgentId((nextAgents[0] || defaultAgents()[0]).id);
        window.Chad.ui.render();
    }

    function editAgent(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);

        if (!agent) {
            return;
        }

        const icon = prompt("Icon/emoji", agent.icon || "🤖");

        if (icon === null) {
            return;
        }

        const name = prompt("Name", agent.name || "Agent");

        if (name === null) {
            return;
        }

        const description = prompt(
            "Description",
            agent.description || ""
        );

        if (description === null) {
            return;
        }

        const chatUrl = prompt(
            "Chat URL",
            agent.chatUrl || "https://chatgpt.com/"
        );

        if (chatUrl === null) {
            return;
        }

        agent.icon = icon.trim() || "🤖";
        agent.name = name.trim() || "Agent";
        agent.description = description.trim();
        agent.chatUrl = chatUrl.trim();
        agent.updatedAt = nowStamp();

        saveAgents(agents);
        window.Chad.ui.render();
    }

    function removeFile(agentId, fileId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);

        if (!agent) {
            return;
        }

        agent.files = (agent.files || []).filter(file => file.id !== fileId);
        agent.updatedAt = nowStamp();

        saveAgents(agents);
        window.Chad.ui.render();
    }

    function renderAgentFile(agent, file) {
        const createEl = window.Chad.ui.createEl;
        const button = window.Chad.ui.button;

        return createEl("div", {
            style: {
                border: "1px solid #e2e8f0",
                borderRadius: "7px",
                padding: "6px",
                marginTop: "5px",
                background: "#ffffff"
            }
        }, [
            createEl("div", {
                html:
                    `<b>📄 ${escapeHTML(file.name)}</b><br>` +
                    `<span style=\"color:#64748b\">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>`,
                style: {
                    fontSize: "11px",
                    lineHeight: "1.35",
                    marginBottom: "5px"
                }
            }),
            createEl("div", {
                style: {
                    display: "flex",
                    gap: "4px",
                    flexWrap: "wrap"
                }
            }, [
                file.url ? button(
                    "OPEN",
                    () => window.open(file.url, "_blank")
                ) : null,
                button(
                    "COPY",
                    () => window.Chad.actions.copyText(
                        file.url || file.name
                    )
                ),
                button(
                    "DELETE",
                    () => removeFile(agent.id, file.id),
                    {
                        bg: "#fee2e2",
                        border: "#fecaca"
                    }
                )
            ])
        ]);
    }

    function renderAgent(agent) {
        const createEl = window.Chad.ui.createEl;
        const button = window.Chad.ui.button;
        const selectedId = getSelectedAgentId();
        const selected = agent.id === selectedId;

        const box = createEl("div", {
            style: {
                border: "1px solid " + (selected ? "#2563eb" : "#cbd5e1"),
                borderRadius: "9px",
                padding: "7px",
                marginTop: "6px",
                background: selected ? "#eff6ff" : "#f8fafc"
            }
        });

        box.appendChild(createEl("div", {
            style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "6px"
            }
        }, [
            createEl("button", {
                html:
                    `${escapeHTML(agent.icon || "🤖")} <b>${escapeHTML(agent.name || "Agent")}</b>`,
                title: agent.description || "",
                style: {
                    flex: "1",
                    textAlign: "left",
                    background: "transparent",
                    border: "0",
                    padding: "3px",
                    cursor: "pointer",
                    color: "#0f172a"
                },
                onclick: () => {
                    setSelectedAgentId(agent.id);
                    window.Chad.ui.render();
                    openAgentTab(agent).catch(error => {
                        alert("Could not open agent tab.\n\n" + error.message);
                    });
                }
            }),
            button(
                "INFO",
                () => editAgent(agent.id),
                {
                    bg: "#fef3c7",
                    border: "#fcd34d"
                }
            )
        ]));

        if (agent.description) {
            box.appendChild(createEl("div", {
                text: agent.description,
                style: {
                    color: "#64748b",
                    fontSize: "11px",
                    marginTop: "3px"
                }
            }));
        }

        if (selected) {
            box.appendChild(createEl("div", {
                style: {
                    display: "flex",
                    gap: "4px",
                    flexWrap: "wrap",
                    marginTop: "6px"
                }
            }, [
                button(
                    "SCAN FILES",
                    saveScannedFilesToSelectedAgent,
                    {
                        bg: "#dcfce7",
                        border: "#86efac",
                        bold: true
                    }
                ),
                button(
                    "COPY LINK",
                    () => window.Chad.actions.copyText(agent.chatUrl || "")
                )
            ]));

            const files = agent.files || [];

            if (!files.length) {
                box.appendChild(createEl("div", {
                    text: "No files yet. Click SCAN FILES while this chat is visible.",
                    style: {
                        color: "#64748b",
                        fontSize: "11px",
                        padding: "7px 2px 0"
                    }
                }));
            }
            else {
                for (const file of files) {
                    box.appendChild(renderAgentFile(agent, file));
                }
            }
        }

        return box;
    }

    function renderAgentsPanel() {
        const createEl = window.Chad.ui.createEl;
        const button = window.Chad.ui.button;
        const agents = getAgents();

        return createEl("div", {
            id: "gandhi-chad-agents-panel",
            style: {
                padding: "8px 9px",
                borderBottom: "1px solid #cbd5e1",
                background: "#ffffff"
            }
        }, [
            createEl("div", {
                style: {
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "5px"
                }
            }, [
                createEl("div", {
                    text: "Agents",
                    style: {
                        fontWeight: "800",
                        color: "#0f172a"
                    }
                }),
                createEl("div", {
                    style: {
                        display: "flex",
                        gap: "4px"
                    }
                }, [
                    button(
                        "+",
                        addAgent,
                        {
                            bg: "#dcfce7",
                            border: "#86efac",
                            bold: true,
                            title: "Add agent"
                        }
                    ),
                    button(
                        "-",
                        deleteSelectedAgent,
                        {
                            bg: "#fee2e2",
                            border: "#fecaca",
                            bold: true,
                            title: "Delete selected agent"
                        }
                    )
                ])
            ]),
            createEl("div", {
                text: canUseChromeTabs()
                    ? "Opens chats in the Chaties tab group."
                    : "Userscript mode: opens the agent link in a tab. Chrome tab grouping needs extension mode.",
                style: {
                    color: "#64748b",
                    fontSize: "10.5px",
                    marginBottom: "5px"
                }
            }),
            ...agents.map(renderAgent)
        ]);
    }

    function injectAgentsPanel() {
        const panel = document.querySelector("#gandhi-chad-panel");

        if (!panel) {
            return;
        }

        if (document.querySelector("#gandhi-chad-agents-panel")) {
            return;
        }

        const header = panel.firstElementChild;

        if (!header) {
            return;
        }

        header.insertAdjacentElement(
            "afterend",
            renderAgentsPanel()
        );
    }

    function patchUI() {
        if (
            !window.Chad.ui ||
            window.Chad.ui.__agentsPatched
        ) {
            return;
        }

        const originalRender = window.Chad.ui.render;

        window.Chad.ui.render = function () {
            originalRender.apply(window.Chad.ui, arguments);
            injectAgentsPanel();
        };

        window.Chad.ui.__agentsPatched = true;
    }

    agentsModule.getAgents = getAgents;
    agentsModule.saveAgents = saveAgents;
    agentsModule.getSelectedAgent = getSelectedAgent;
    agentsModule.scanVisibleChatFiles = scanVisibleChatFiles;
    agentsModule.saveScannedFilesToSelectedAgent = saveScannedFilesToSelectedAgent;
    agentsModule.openAgentTab = openAgentTab;
    agentsModule.patchUI = patchUI;

    window.Chad.agents = agentsModule;

    patchUI();
})();
