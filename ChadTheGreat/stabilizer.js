window.Chad = window.Chad || {};

(function () {
    "use strict";

    const stabilizer = {};
    const GLOBAL_AGENTS_KEY = "gandhi_chad_global_agents_v1";
    const ACTIVE_AGENT_KEY = "gandhi_chad_active_agent_id_v1";
    const TASK_DONE_COLOR_KEY = "gandhi_chad_task_done_flash_v1";
    const CHATIES_GROUP_NAME = "Chaties";
    let lastRenderedActiveTab = "";

    function nowStamp() {
        return new Date().toLocaleString();
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
                tabTitle: "👩🏼 Brenda",
                files: [],
                taskDone: false,
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
                taskDone: false,
                createdAt: nowStamp(),
                updatedAt: nowStamp()
            }
        ];
    }

    function migrateOldAgents() {
        const existing = loadJSON(GLOBAL_AGENTS_KEY, null);

        if (existing && Array.isArray(existing) && existing.length) {
            return existing;
        }

        const migrated = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);

            if (!key || !key.startsWith("gandhi_chad_agents_v1:")) {
                continue;
            }

            const agents = loadJSON(key, []);

            if (!Array.isArray(agents)) {
                continue;
            }

            for (const agent of agents) {
                if (!agent || !agent.id) {
                    continue;
                }

                if (!migrated.some(item => item.id === agent.id)) {
                    migrated.push({
                        ...agent,
                        tabTitle: agent.tabTitle || `${agent.icon || "🤖"} ${agent.name || "Agent"}`,
                        files: agent.files || [],
                        taskDone: Boolean(agent.taskDone)
                    });
                }
            }
        }

        const finalAgents = migrated.length ? migrated : defaultAgents();
        saveJSON(GLOBAL_AGENTS_KEY, finalAgents);
        return finalAgents;
    }

    function getAgents() {
        const agents = migrateOldAgents();

        for (const agent of agents) {
            if (!agent.tabTitle) {
                agent.tabTitle = `${agent.icon || "🤖"} ${agent.name || "Agent"}`;
            }

            if (!agent.files) {
                agent.files = [];
            }
        }

        saveJSON(GLOBAL_AGENTS_KEY, agents);
        return agents;
    }

    function saveAgents(agents) {
        saveJSON(GLOBAL_AGENTS_KEY, agents);
    }

    function getActiveAgentId() {
        const agents = getAgents();
        const saved = localStorage.getItem(ACTIVE_AGENT_KEY);

        if (agents.some(agent => agent.id === saved)) {
            return saved;
        }

        return agents[0] ? agents[0].id : "";
    }

    function setActiveAgentId(id) {
        localStorage.setItem(ACTIVE_AGENT_KEY, id || "");
    }

    function getActiveAgent() {
        const id = getActiveAgentId();
        return getAgents().find(agent => agent.id === id) || getAgents()[0] || null;
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
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

    function applyTabIdentity() {
        const agent = getActiveAgent();

        if (!agent) {
            return;
        }

        const title = agent.tabTitle || `${agent.icon || "🤖"} ${agent.name || "Agent"}`;
        document.title = agent.description
            ? `${title} — ${agent.description}`
            : title;
        setFavicon(agent.icon || "🤖");
    }

    function scrollToLatestConversation() {
        setTimeout(() => {
            try {
                const candidates = [
                    document.querySelector("main"),
                    document.querySelector("[role='main']"),
                    document.scrollingElement,
                    document.documentElement,
                    document.body
                ].filter(Boolean);

                for (const target of candidates) {
                    target.scrollTop = target.scrollHeight;
                }

                window.scrollTo(0, document.body.scrollHeight);
            }
            catch {}
        }, 900);
    }

    function autoScanTasks() {
        setTimeout(() => {
            if (window.Chad.scanner && typeof window.Chad.scanner.scanTasks === "function") {
                window.Chad.scanner.scanTasks();
            }
        }, 1400);
    }

    function markTaskDoneFlash() {
        const until = Date.now() + 8000;
        localStorage.setItem(TASK_DONE_COLOR_KEY, String(until));
        paintTaskDoneState();
    }

    function isTaskDoneFlashing() {
        const until = Number(localStorage.getItem(TASK_DONE_COLOR_KEY) || 0);
        return Date.now() < until;
    }

    function paintTaskDoneState() {
        const panel = document.querySelector("#gandhi-chad-panel");

        if (!panel) {
            return;
        }

        const activeAgent = getActiveAgent();
        const header = panel.firstElementChild;

        if (header) {
            header.style.border = isTaskDoneFlashing()
                ? "3px solid #22c55e"
                : "";
            header.style.boxShadow = isTaskDoneFlashing()
                ? "0 0 0 3px rgba(34,197,94,.25) inset"
                : "";
        }

        if (activeAgent) {
            const rows = panel.querySelectorAll("[data-chad-stable-agent-id]");
            rows.forEach(row => {
                if (row.dataset.chadStableAgentId === activeAgent.id && isTaskDoneFlashing()) {
                    row.style.background = "#dcfce7";
                    row.style.borderColor = "#22c55e";
                }
            });
        }
    }

    function patchDoneButtons() {
        document.querySelectorAll("#gandhi-chad-panel button").forEach(button => {
            if (button.textContent.trim() !== "DONE" || button.dataset.chadDonePatched) {
                return;
            }

            button.dataset.chadDonePatched = "1";
            button.addEventListener("click", () => {
                markTaskDoneFlash();
            }, true);
        });
    }

    function openAgent(agent) {
        setActiveAgentId(agent.id);
        saveAgents(getAgents().map(item => item.id === agent.id ? {
            ...item,
            chatUrl: item.chatUrl || currentChatUrl(),
            updatedAt: nowStamp()
        } : item));
        applyTabIdentity();

        if (window.Chad.bridge && window.Chad.bridge.isExtension && window.Chad.bridge.isExtension()) {
            window.Chad.bridge.openAgentTab(agent).catch(error => {
                console.warn("[Chad Stabilizer] openAgentTab failed", error);
                window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
            });
        }
        else {
            window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
        }
    }

    function scanFilesForAgent(agentId) {
        if (!window.Chad.agents || typeof window.Chad.agents.scanVisibleChatFiles !== "function") {
            return [];
        }

        const found = window.Chad.agents.scanVisibleChatFiles();
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);

        if (!agent) {
            return [];
        }

        const map = new Map();
        for (const file of agent.files || []) {
            map.set(String(file.url || file.name || file.id).toLowerCase(), file);
        }
        for (const file of found || []) {
            const key = String(file.url || file.name || file.id).toLowerCase();
            if (!map.has(key)) {
                map.set(key, file);
            }
        }

        agent.files = Array.from(map.values());
        agent.updatedAt = nowStamp();
        saveAgents(agents);
        return agent.files;
    }

    function renderStableAgentFile(agent, file) {
        return `
            <div style="border:1px solid #e2e8f0;border-radius:7px;padding:6px;margin-top:5px;background:#fff">
                <div style="font-size:11px;line-height:1.35;margin-bottom:5px">
                    <b>📄 ${escapeHTML(file.name)}</b><br>
                    <span style="color:#64748b">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                    <button data-copy-file="${escapeHTML(file.url || file.name)}">COPY</button>
                    <button data-delete-file="${escapeHTML(file.id)}">DELETE</button>
                </div>
            </div>`;
    }

    function renderStableChaties() {
        const panel = document.querySelector("#gandhi-chad-panel");
        const state = window.Chad.storage && window.Chad.storage.state;

        if (!panel || !state || state.activeTab !== "chaties") {
            return;
        }

        panel.querySelectorAll("#gandhi-chad-chaties-body, #gandhi-chad-stable-chaties").forEach(el => el.remove());

        const agents = getAgents();
        const activeId = getActiveAgentId();
        const html = document.createElement("div");
        html.id = "gandhi-chad-stable-chaties";
        Object.assign(html.style, {
            padding: "8px",
            overflowY: "auto",
            height: "calc(100vh - 158px)",
            background: "#ffffff"
        });

        html.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
                <div><b>Chaties</b><br><span style="color:#64748b">Stable global agents. Tabs use the Chaties group.</span></div>
                <button data-add-agent="1" style="background:#dcfce7;border:1px solid #86efac;border-radius:6px;padding:4px 9px;font-weight:800">+</button>
            </div>
            ${agents.map(agent => {
                const active = agent.id === activeId;
                const files = agent.files || [];
                return `
                    <div data-chad-stable-agent-id="${escapeHTML(agent.id)}" style="border:1px solid ${active ? "#2563eb" : "#cbd5e1"};border-radius:9px;padding:7px;margin-top:6px;background:${active ? "#eff6ff" : "#f8fafc"}">
                        <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
                            <button data-open-agent="${escapeHTML(agent.id)}" style="flex:1;text-align:left;background:transparent;border:0;padding:3px;cursor:pointer;color:#0f172a">
                                ${escapeHTML(agent.icon || "🤖")} <b>${escapeHTML(agent.name || "Agent")}</b>
                            </button>
                            <button data-edit-agent="${escapeHTML(agent.id)}" style="background:#fef3c7;border:1px solid #fcd34d;border-radius:6px;padding:4px 7px;font-size:11px;font-weight:700">INFO</button>
                        </div>
                        <div data-edit-desc="${escapeHTML(agent.id)}" title="Click to edit description" style="color:${agent.description ? "#64748b" : "#94a3b8"};font-size:11px;margin-top:3px;cursor:pointer">
                            ${escapeHTML(agent.description || "Click to add description.")}
                        </div>
                        ${active ? `
                            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
                                <button data-scan-files="${escapeHTML(agent.id)}" style="background:#dcfce7;border:1px solid #86efac;border-radius:6px;padding:4px 7px;font-size:11px;font-weight:700">SCAN FILES</button>
                                <button data-use-chat="${escapeHTML(agent.id)}" style="background:#e0f2fe;border:1px solid #7dd3fc;border-radius:6px;padding:4px 7px;font-size:11px">USE THIS CHAT</button>
                                <button data-copy-link="${escapeHTML(agent.id)}" style="background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px;padding:4px 7px;font-size:11px">COPY LINK</button>
                                <button data-task-done-agent="${escapeHTML(agent.id)}" style="background:#bbf7d0;border:1px solid #22c55e;border-radius:6px;padding:4px 7px;font-size:11px;font-weight:700">DONE COLOR</button>
                                <button data-delete-agent="${escapeHTML(agent.id)}" style="background:#fee2e2;border:1px solid #fecaca;border-radius:6px;padding:4px 7px;font-size:11px">DELETE AGENT</button>
                            </div>
                            <div style="margin-top:6px">
                                ${files.length ? files.map(file => renderStableAgentFile(agent, file)).join("") : `<div style="color:#64748b;font-size:11px;padding:7px 2px 0">No files yet. Click SCAN FILES.</div>`}
                            </div>
                        ` : ""}
                    </div>`;
            }).join("")}
        `;

        panel.appendChild(html);
        bindStableChatiesEvents(html);
        paintTaskDoneState();
    }

    function bindStableChatiesEvents(root) {
        root.addEventListener("click", event => {
            const target = event.target.closest("button, [data-edit-desc]");
            if (!target) return;

            const addAgent = target.dataset.addAgent;
            const openId = target.dataset.openAgent;
            const editId = target.dataset.editAgent;
            const descId = target.dataset.editDesc;
            const scanId = target.dataset.scanFiles;
            const useId = target.dataset.useChat;
            const copyId = target.dataset.copyLink;
            const deleteId = target.dataset.deleteAgent;
            const doneId = target.dataset.taskDoneAgent;
            const copyFile = target.dataset.copyFile;
            const deleteFile = target.dataset.deleteFile;

            if (addAgent) {
                const agents = getAgents();
                const agent = {
                    id: "agent-" + Date.now(),
                    icon: "🤖",
                    name: "New Agent",
                    description: "",
                    chatUrl: "https://chatgpt.com/",
                    tabTitle: "🤖 New Agent",
                    files: [],
                    taskDone: false,
                    createdAt: nowStamp(),
                    updatedAt: nowStamp()
                };
                agents.push(agent);
                saveAgents(agents);
                setActiveAgentId(agent.id);
                renderAll();
                return;
            }

            if (openId) {
                const agent = getAgents().find(item => item.id === openId);
                if (agent) {
                    setActiveAgentId(agent.id);
                    applyTabIdentity();
                    openAgent(agent);
                    autoScanTasks();
                    scrollToLatestConversation();
                    renderAll();
                }
                return;
            }

            if (editId) {
                editAgentSimple(editId);
                return;
            }

            if (descId) {
                editDescriptionSimple(descId);
                return;
            }

            if (scanId) {
                scanFilesForAgent(scanId);
                renderAll();
                return;
            }

            if (useId) {
                const agents = getAgents();
                const agent = agents.find(item => item.id === useId);
                if (agent) {
                    agent.chatUrl = currentChatUrl();
                    agent.updatedAt = nowStamp();
                    saveAgents(agents);
                    setActiveAgentId(agent.id);
                    applyTabIdentity();
                    renderAll();
                }
                return;
            }

            if (copyId) {
                const agent = getAgents().find(item => item.id === copyId);
                if (agent && window.Chad.actions) {
                    window.Chad.actions.copyText(agent.chatUrl || "");
                }
                return;
            }

            if (deleteId) {
                const agents = getAgents().filter(item => item.id !== deleteId);
                saveAgents(agents.length ? agents : defaultAgents());
                setActiveAgentId((agents[0] || defaultAgents()[0]).id);
                renderAll();
                return;
            }

            if (doneId) {
                setActiveAgentId(doneId);
                markTaskDoneFlash();
                renderAll();
                return;
            }

            if (copyFile && window.Chad.actions) {
                window.Chad.actions.copyText(copyFile);
                return;
            }

            if (deleteFile) {
                const agents = getAgents();
                const agent = agents.find(item => item.id === getActiveAgentId());
                if (agent) {
                    agent.files = (agent.files || []).filter(file => file.id !== deleteFile);
                    saveAgents(agents);
                    renderAll();
                }
            }
        });
    }

    function editDescriptionSimple(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;

        const next = prompt("Description", agent.description || "");
        if (next === null) return;

        agent.description = next.trim();
        agent.updatedAt = nowStamp();
        saveAgents(agents);
        applyTabIdentity();
        renderAll();
    }

    function editAgentSimple(agentId) {
        const agents = getAgents();
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

        agent.icon = icon.trim() || "🤖";
        agent.name = name.trim() || "Agent";
        agent.description = description.trim();
        agent.chatUrl = chatUrl.trim() || "https://chatgpt.com/";
        agent.tabTitle = tabTitle.trim() || `${agent.icon} ${agent.name}`;
        agent.updatedAt = nowStamp();

        saveAgents(agents);
        setActiveAgentId(agent.id);
        applyTabIdentity();
        renderAll();
    }

    function ensureTopControls() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;

        const header = panel.firstElementChild;
        if (!header) return;

        const topButtonArea = header.querySelector("div > div:nth-child(2)");
        if (!topButtonArea) return;

        const buttons = Array.from(topButtonArea.querySelectorAll("button"));
        buttons.forEach(button => {
            if (["RULES", "CHAT RULES"].includes(button.textContent.trim())) {
                button.remove();
            }
        });

        if (!topButtonArea.querySelector("#gandhi-chad-god-rules")) {
            const godRules = document.createElement("button");
            godRules.id = "gandhi-chad-god-rules";
            godRules.textContent = "GOD RULES";
            styleSmallButton(godRules, "#ede9fe", "#c4b5fd", true);
            godRules.onclick = () => {
                const text = (window.Chad.data.companionRules || "") + "\n\n\n" + (window.Chad.data.chatRules || "");
                window.Chad.actions.copyText(text);
            };
            topButtonArea.insertBefore(godRules, topButtonArea.firstChild);
        }

        let paint = topButtonArea.querySelector("#gandhi-chad-paint-button");
        if (!paint) {
            paint = document.createElement("button");
            paint.id = "gandhi-chad-paint-button";
            paint.textContent = "🎨";
            styleSmallButton(paint, "#fef3c7", "#fcd34d", true);
            paint.onclick = () => window.Chad.paint && window.Chad.paint.open();
            topButtonArea.insertBefore(paint, topButtonArea.children[1] || null);
        }

        let gitgit = topButtonArea.querySelector("#gandhi-chad-gitgit-button");
        if (!gitgit) {
            gitgit = document.createElement("button");
            gitgit.id = "gandhi-chad-gitgit-button";
            gitgit.textContent = "🐒";
            gitgit.title = "GitGit";
            gitgit.dataset.internalName = "GitGit";
            styleSmallButton(gitgit, "#fef3c7", "#fcd34d", true);
            gitgit.onclick = () => console.log("GitGit reserved.");
            paint.insertAdjacentElement("afterend", gitgit);
        }

        const minusButtons = Array.from(topButtonArea.querySelectorAll("button"))
            .filter(button => ["—", "-", "□"].includes(button.textContent.trim()));
        minusButtons.forEach(button => button.remove());
    }

    function styleSmallButton(button, bg, border, bold) {
        Object.assign(button.style, {
            background: bg,
            border: "1px solid " + border,
            borderRadius: "6px",
            padding: "4px 7px",
            fontSize: "11px",
            cursor: "pointer",
            whiteSpace: "nowrap",
            fontWeight: bold ? "700" : "500"
        });
    }

    function ensureChatiesTab() {
        const panel = document.querySelector("#gandhi-chad-panel");
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!panel || !state) return;

        const scanButton = Array.from(panel.querySelectorAll("button"))
            .find(button => button.textContent.trim() === "Scan");

        if (!scanButton || !scanButton.parentElement) return;

        if (!scanButton.parentElement.querySelector("#gandhi-chad-chaties-tab")) {
            const tab = document.createElement("button");
            tab.id = "gandhi-chad-chaties-tab";
            tab.textContent = "Chaties";
            tab.onclick = () => {
                state.activeTab = "chaties";
                setActiveAgentId(getActiveAgentId());
                window.Chad.ui.render();
                renderAll();
            };
            scanButton.parentElement.insertBefore(tab, scanButton.parentElement.firstChild);
        }

        const chaties = scanButton.parentElement.querySelector("#gandhi-chad-chaties-tab");
        Object.assign(chaties.style, {
            background: state.activeTab === "chaties" ? "#2563eb" : "#ffffff",
            color: state.activeTab === "chaties" ? "#ffffff" : "#0f172a",
            border: "1px solid " + (state.activeTab === "chaties" ? "#2563eb" : "#cbd5e1"),
            borderRadius: "6px",
            padding: "4px 7px",
            fontSize: "11px",
            cursor: "pointer",
            fontWeight: state.activeTab === "chaties" ? "700" : "500"
        });
    }

    function renderHeaderIdentity() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;

        const header = panel.firstElementChild;
        if (!header || !header.firstElementChild) return;

        const title = header.firstElementChild.firstElementChild;
        const agent = getActiveAgent();
        if (!title || !agent) return;

        title.innerHTML = `
            <div style="font-size:10px;color:#64748b;font-weight:800;line-height:1">Chad</div>
            <div style="font-size:17px;color:#0f172a;font-weight:900;line-height:1.15">${escapeHTML(agent.icon)} ${escapeHTML(agent.name)}</div>
            <div style="font-size:11px;color:#64748b;font-weight:600;max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHTML(agent.description)}</div>`;
    }

    function suppressPaintPasteDialogs() {
        document.addEventListener("paste", event => {
            const paintWindow = document.querySelector("#gandhi-chad-paint-window");
            if (!paintWindow) return;

            const hasImage = Array.from(event.clipboardData && event.clipboardData.items || [])
                .some(item => item.type && item.type.startsWith("image/"));

            if (hasImage) {
                setTimeout(() => {
                    document.querySelectorAll("body > div").forEach(el => {
                        if (el.textContent && /Image pasted|Selected area copied|copied/i.test(el.textContent)) {
                            const z = Number(el.style.zIndex || 0);
                            if (z >= 1000008) el.remove();
                        }
                    });
                }, 80);
            }
        }, true);
    }

    function setActiveTabStable(tab) {
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!state) return;
        state.activeTab = tab;
        window.Chad.ui.render();
        renderAll();
    }

    function patchUIRender() {
        if (!window.Chad.ui || window.Chad.ui.__stabilizerPatched) return;

        const originalRender = window.Chad.ui.render;
        window.Chad.ui.render = function () {
            originalRender.apply(window.Chad.ui, arguments);
            renderAll();
        };

        window.Chad.ui.__stabilizerPatched = true;
    }

    function renderAll() {
        applyTabIdentity();
        ensureTopControls();
        ensureChatiesTab();
        renderHeaderIdentity();
        renderStableChaties();
        patchDoneButtons();
        paintTaskDoneState();

        const state = window.Chad.storage && window.Chad.storage.state;
        if (state && lastRenderedActiveTab !== state.activeTab) {
            lastRenderedActiveTab = state.activeTab;
            if (state.activeTab !== "chaties") {
                setTimeout(() => {
                    ensureTopControls();
                    ensureChatiesTab();
                    renderHeaderIdentity();
                    patchDoneButtons();
                }, 0);
            }
        }
    }

    function start() {
        patchUIRender();
        suppressPaintPasteDialogs();
        applyTabIdentity();
        scrollToLatestConversation();
        autoScanTasks();
        setInterval(() => {
            applyTabIdentity();
            paintTaskDoneState();
        }, 2500);
        setTimeout(renderAll, 500);
        setTimeout(renderAll, 1500);
    }

    stabilizer.getAgents = getAgents;
    stabilizer.saveAgents = saveAgents;
    stabilizer.getActiveAgent = getActiveAgent;
    stabilizer.setActiveTab = setActiveTabStable;
    stabilizer.renderAll = renderAll;
    stabilizer.markTaskDoneFlash = markTaskDoneFlash;

    window.Chad.stabilizer = stabilizer;
    start();
})();
