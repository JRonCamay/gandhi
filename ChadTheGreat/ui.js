window.Chad = window.Chad || {};

(function () {
    "use strict";

    const ui = {};
    let panel = null;
    let body = null;
    let contextMenu = null;
    const GLOBAL_AGENTS_KEY = "gandhi_chad_global_agents_v1";
    const ACTIVE_AGENT_KEY = "gandhi_chad_active_agent_id_v1";
    const DONE_FLASH_KEY = "gandhi_chad_task_done_flash_v1";
    const GLOBAL_NOTES_KEY = "gandhi_chad_shared_notes_v1";

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
            height: "calc(100vh - 158px)",
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
        return location.href.includes("/c/")
            ? location.href.split("#")[0]
            : "https://chatgpt.com/";
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

    function applyTabIdentity() {
        const agent = getActiveAgent();
        if (!agent) return;

        const done = isDoneFlashing();
        const prefix = done ? "✅ " : "";
        const icon = done ? "✅" : (agent.icon || "🤖");

        document.title = agent.description
            ? `${prefix}${agent.tabTitle || agent.name} — ${agent.description}`
            : `${prefix}${agent.tabTitle || agent.name}`;
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
        applyTabIdentity();
        render();
    }

    function isDoneFlashing() {
        return Date.now() < Number(localStorage.getItem(DONE_FLASH_KEY) || 0);
    }

    function scrollToLatest() {
        setTimeout(() => {
            try {
                const targets = [
                    document.querySelector("main"),
                    document.querySelector("[role='main']"),
                    document.scrollingElement,
                    document.documentElement,
                    document.body
                ].filter(Boolean);
                for (const target of targets) target.scrollTop = target.scrollHeight;
                window.scrollTo(0, document.body.scrollHeight);
            }
            catch {}
        }, 900);
    }

    function autoScanTasks() {
        setTimeout(() => {
            if (window.Chad.scanner && window.Chad.scanner.scanTasks) window.Chad.scanner.scanTasks();
        }, 1200);
    }

    function getTaskRulesText() {
        return `TASK FORMATTING RULES

Every task should use this format:

🚨 CH-001 🚨

Project:
ChadTheGreat

Title:
Short title

Timestamp:
YYYY-MM-DD

Task:
Exact instruction here.

Rules:
- Keep it simple.
- One feature at a time.
- Do not touch unrelated files.

Files to touch:
- file.js

Files not to touch:
- unrelated.js

Completion report:
🔥🔥🔥 CH-001 COMPLETED 🔥🔥🔥
CH-001 COMPLETED
CH-001 COMPLETED`;
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

        document.querySelectorAll("pre, code, p, li, div").forEach(node => {
            const text = node.textContent || "";
            let match;
            while ((match = filePattern.exec(text))) addFile(match[1], "", "text");
        });

        return Array.from(map.values());
    }

    function renderHeader() {
        const state = window.Chad.storage.state;
        const agent = getActiveAgent();
        const tabs = [
            ["Chaties", "chaties"],
            ["Tasks", "tasks"],
            ["Roadmap", "roadmap"],
            ["Pins", "pins"],
            ["Repo", "repo"],
            ["Notes", "notes"]
        ];

        const header = createEl("div", {
            style: {
                padding: "9px",
                background: isDoneFlashing() ? "#dcfce7" : "#f1f5f9",
                borderBottom: "1px solid " + (isDoneFlashing() ? "#22c55e" : "#cbd5e1"),
                boxShadow: isDoneFlashing() ? "0 0 0 3px rgba(34,197,94,.25) inset" : "none"
            }
        });

        const top = createEl("div", {
            style: {
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "8px",
                marginBottom: "7px"
            }
        });

        top.appendChild(createEl("div", {
            html:
                `<div style="font-size:10px;color:#64748b;font-weight:800;line-height:1">Chad</div>` +
                `<div style="font-size:17px;color:#0f172a;font-weight:900;line-height:1.15">${escapeHTML(agent ? agent.icon : "🤖")} ${escapeHTML(agent ? agent.name : "Agent")}</div>` +
                `<div style="font-size:11px;color:#64748b;font-weight:600;max-width:190px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${escapeHTML(agent ? agent.description : "")}</div>`
        }));

        top.appendChild(createEl("div", { style: { display: "flex", gap: "4px", alignItems: "center" } }, [
            button("TASK RULES", () => window.Chad.actions.copyText(getTaskRulesText()), { bg: "#e0f2fe", border: "#7dd3fc", bold: true }),
            button("GOD RULES", () => {
                const text = (window.Chad.data.companionRules || "") + "\n\n\n" + (window.Chad.data.chatRules || "");
                window.Chad.actions.copyText(text);
            }, { bg: "#ede9fe", border: "#c4b5fd", bold: true }),
            button("🎨", () => window.Chad.paint && window.Chad.paint.open(), { bg: "#fef3c7", border: "#fcd34d", bold: true, title: "Quick Sketch" }),
            button("🐒", () => console.log("GitGit reserved."), { bg: "#fef3c7", border: "#fcd34d", bold: true, title: "GitGit" }),
            button("✕", () => { panel.style.display = "none"; }, { bg: "#f8fafc", border: "#cbd5e1" })
        ]));

        const tabRow = createEl("div", { style: { display: "flex", gap: "5px", flexWrap: "wrap" } });

        for (const [label, tab] of tabs) {
            tabRow.appendChild(button(label, () => {
                state.activeTab = tab;
                render();
                if (tab === "repo") window.Chad.actions.ensureRepoTreeLoaded();
            }, {
                bg: state.activeTab === tab ? "#2563eb" : "#ffffff",
                color: state.activeTab === tab ? "#ffffff" : "#0f172a",
                border: state.activeTab === tab ? "#2563eb" : "#cbd5e1",
                bold: state.activeTab === tab
            }));
        }

        tabRow.appendChild(button("Scan", window.Chad.scanner.scanTasks, { bg: "#dcfce7", border: "#86efac", bold: true }));
        tabRow.appendChild(createEl("span", {
            id: "gandhi-chad-scan-status",
            text: "",
            style: { fontSize: "11px", color: "#64748b", alignSelf: "center" }
        }));

        header.appendChild(top);
        header.appendChild(tabRow);
        return header;
    }

    function renderProjectFilters() {
        const state = window.Chad.storage.state;
        return createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "8px" } },
            window.Chad.data.projectOrder.map(project => button(project, () => {
                state.activeProject = project;
                render();
            }, {
                bg: state.activeProject === project ? "#0f172a" : "#ffffff",
                color: state.activeProject === project ? "#ffffff" : "#0f172a",
                border: state.activeProject === project ? "#0f172a" : "#cbd5e1",
                bold: state.activeProject === project
            }))
        );
    }

    function renderTasks() {
        const store = window.Chad.storage;
        const state = store.state;
        const wrap = createEl("div", { style: bodyStyle() });

        wrap.appendChild(createEl("div", { style: { display: "flex", gap: "5px", marginBottom: "8px", flexWrap: "wrap" } }, [
            button("SCAN", window.Chad.scanner.scanTasks, { bg: "#dcfce7", border: "#86efac", bold: true }),
            button("RESET DELETED", () => {
                if (!confirm("Allow deleted tasks to be scanned again in this chat?")) return;
                store.resetDeletedTasks();
                window.Chad.scanner.scanTasks();
            }, { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        wrap.appendChild(renderProjectFilters());
        let tasks = [...state.tasks];
        if (state.activeProject !== "ALL") tasks = tasks.filter(task => task.project === state.activeProject);

        if (!tasks.length) wrap.appendChild(createEl("div", { text: "No tasks yet. Click SCAN.", style: { color: "#64748b", padding: "10px" } }));
        for (const task of tasks.reverse()) wrap.appendChild(renderTaskCard(task));
        return wrap;
    }

    function renderTaskCard(task) {
        const done = task.status === "Completed";
        return createEl("div", {
            style: {
                border: "1px solid " + (done ? "#86efac" : "#cbd5e1"),
                borderRadius: "9px",
                padding: "8px",
                marginBottom: "8px",
                background: done ? "#f0fdf4" : "#f8fafc"
            }
        }, [
            createEl("div", { html: `<b>${escapeHTML(task.id)}</b><br><span style="color:#334155">${escapeHTML(task.title)}</span>` }),
            createEl("div", {
                html:
                    `<span style="color:#64748b">Project:</span> ${escapeHTML(task.project || "")}<br>` +
                    `<span style="color:#64748b">Status:</span> ${escapeHTML(task.status || "Pending")}<br>` +
                    `<span style="color:#64748b">Updated:</span> ${escapeHTML(task.updatedAt || "")}`,
                style: { fontSize: "11px", color: "#334155", lineHeight: "1.35", marginTop: "5px" }
            }),
            createEl("div", { style: { display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "7px" } }, [
                button("OPEN", () => openTextModal(task.id + " — " + task.title, task.prompt)),
                button("SRC", () => window.Chad.actions.scrollToTask(task)),
                button("COPY", () => window.Chad.actions.copyText(task.prompt)),
                button("DUE", () => window.Chad.actions.setDeadline(task)),
                button("DONE", () => {
                    window.Chad.actions.markDone(task);
                    markDoneFlash();
                }, { bg: "#dcfce7", border: "#86efac", bold: true }),
                button("DELETE", () => window.Chad.actions.deleteTask(task), { bg: "#fee2e2", border: "#fecaca" })
            ])
        ]);
    }

    function renderChaties() {
        const wrap = createEl("div", { style: bodyStyle() });
        const agents = getAgents();
        const activeId = getActiveAgentId();

        wrap.appendChild(createEl("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" } }, [
            createEl("div", { html: `<b>Chaties</b><br><span style="color:#64748b">Global agents. Opens tabs in the Chaties group.</span>` }),
            button("+", () => {
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

    function renderAgentCard(agent, active) {
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

        box.appendChild(createEl("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "6px" } }, [
            button(`${agent.icon || "🤖"} ${agent.name || "Agent"}`, () => openAgent(agent), {
                bg: "transparent", border: "transparent", bold: true, padding: "3px", fontSize: "12px"
            }),
            button("INFO", () => editAgent(agent.id), { bg: "#fef3c7", border: "#fcd34d" })
        ]));

        box.appendChild(createEl("div", {
            text: agent.description || "Click INFO to add description.",
            style: { color: agent.description ? "#64748b" : "#94a3b8", fontSize: "11px", marginTop: "3px" }
        }));

        if (active) {
            box.appendChild(createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "6px" } }, [
                button("SCAN FILES", () => { scanFiles(agent.id); render(); }, { bg: "#dcfce7", border: "#86efac", bold: true }),
                button("USE THIS CHAT", () => { agent.chatUrl = currentChatUrl(); agent.updatedAt = nowStamp(); saveAgents(getAgents().map(a => a.id === agent.id ? agent : a)); render(); }, { bg: "#e0f2fe", border: "#7dd3fc" }),
                button("COPY LINK", () => window.Chad.actions.copyText(agent.chatUrl || "")),
                button("DELETE AGENT", () => { const next = getAgents().filter(a => a.id !== agent.id); saveAgents(next.length ? next : defaultAgents()); setActiveAgentId((next[0] || defaultAgents()[0]).id); render(); }, { bg: "#fee2e2", border: "#fecaca" })
            ]));

            if (!agent.files || !agent.files.length) {
                box.appendChild(createEl("div", { text: "No files yet. Click SCAN FILES.", style: { color: "#64748b", fontSize: "11px", padding: "7px 2px 0" } }));
            }
            else {
                for (const file of agent.files) box.appendChild(renderAgentFile(agent, file));
            }
        }

        return box;
    }

    function renderAgentFile(agent, file) {
        return createEl("div", { style: { border: "1px solid #e2e8f0", borderRadius: "7px", padding: "6px", marginTop: "5px", background: "#ffffff" } }, [
            createEl("div", {
                html: `<b>📄 ${escapeHTML(file.name)}</b><br><span style="color:#64748b">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>`,
                style: { fontSize: "11px", lineHeight: "1.35", marginBottom: "5px" }
            }),
            createEl("div", { style: { display: "flex", gap: "4px", flexWrap: "wrap" } }, [
                file.url ? button("OPEN", () => window.open(file.url, "_blank")) : null,
                button("COPY", () => window.Chad.actions.copyText(file.url || file.name)),
                button("DELETE", () => {
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
        autoScanTasks();
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

    function renderRoadmap() {
        const wrap = createEl("div", { style: bodyStyle() });
        wrap.appendChild(button("Refresh Repo Memory", window.Chad.actions.refreshRepoMemory, { bg: "#ede9fe", border: "#c4b5fd", bold: true }));
        wrap.appendChild(createEl("div", { style: { height: "8px" } }));
        for (const item of window.Chad.storage.state.roadmap) {
            wrap.appendChild(createEl("div", { style: { border: "1px solid #cbd5e1", borderRadius: "9px", padding: "8px", marginBottom: "8px", background: "#f8fafc" } }, [
                createEl("div", { html: `<b>${escapeHTML(item.title)}</b><br><span style="color:#ca8a04">${escapeHTML(item.status)}</span><br><span style="color:#64748b">Updated: ${escapeHTML(item.updatedAt || "")}</span>` }),
                createEl("pre", { text: item.text, style: { whiteSpace: "pre-wrap", fontFamily: "Consolas, monospace", fontSize: "11px", color: "#334155", margin: "7px 0 0" } })
            ]));
        }
        return wrap;
    }

    function renderPins() {
        const state = window.Chad.storage.state;
        const wrap = createEl("div", { style: bodyStyle() });
        wrap.appendChild(createEl("div", { style: { display: "flex", gap: "5px", marginBottom: "8px" } }, [
            button("Pin Selected", window.Chad.actions.pinSelection, { bg: "#ede9fe", border: "#c4b5fd" }),
            button("Pin Last", window.Chad.actions.pinLastAssistant, { bg: "#ede9fe", border: "#c4b5fd" })
        ]));
        if (!state.pins.length) wrap.appendChild(createEl("div", { text: "No pinned responses yet.", style: { color: "#64748b", padding: "10px" } }));
        for (const pin of state.pins) {
            wrap.appendChild(createEl("div", { style: { border: "1px solid #cbd5e1", borderRadius: "9px", padding: "8px", marginBottom: "8px", background: "#f8fafc" } }, [
                createEl("div", { html: `<b>${escapeHTML(pin.title)}</b><br><span style="color:#64748b">${escapeHTML(pin.createdAt)}</span>`, style: { marginBottom: "6px" } }),
                createEl("div", { style: { display: "flex", gap: "4px", marginBottom: "6px" } }, [
                    button("OPEN", () => openTextModal(pin.title, pin.text)),
                    button("SRC", () => window.Chad.actions.scrollToPin(pin)),
                    button("COPY", () => window.Chad.actions.copyText(pin.text)),
                    button("DELETE", () => { state.pins = state.pins.filter(item => item.id !== pin.id); window.Chad.storage.savePins(); render(); }, { bg: "#fee2e2", border: "#fecaca" })
                ])
            ]));
        }
        return wrap;
    }

    function renderRepo() {
        const state = window.Chad.storage.state;
        const repo = window.Chad.data.repo;
        const wrap = createEl("div", { style: bodyStyle() });
        wrap.appendChild(createEl("div", { html: `<b>${repo.owner}/${repo.repo}</b><br><span style="color:#64748b">Branch: ${repo.branch}</span>`, style: { marginBottom: "8px" } }));
        wrap.appendChild(createEl("div", { style: { display: "flex", gap: "5px", marginBottom: "8px" } }, [
            button("Refresh Tree", () => window.Chad.actions.loadRepoTree(true), { bg: "#e0f2fe", border: "#7dd3fc", bold: true }),
            button("Copy Repo URL", () => window.Chad.actions.copyText(`https://github.com/${repo.owner}/${repo.repo}`))
        ]));
        if (state.repoLoading) return wrap.appendChild(createEl("div", { text: "Loading repo tree...", style: { color: "#64748b", padding: "10px" } })), wrap;
        if (!state.repoTree) return wrap.appendChild(createEl("div", { text: "Click Refresh Tree to load the Gandhi repo file tree.", style: { color: "#64748b", padding: "10px" } })), wrap;
        renderRepoTree(wrap, state.repoTree.items || []);
        return wrap;
    }

    function renderRepoTree(wrap, items) {
        const folders = {};
        for (const item of items) {
            const parts = item.path.split("/");
            const folder = parts.length > 1 ? parts[0] : "";
            if (!folders[folder]) folders[folder] = [];
            folders[folder].push(item);
        }
        for (const [folder, list] of Object.entries(folders).sort()) {
            if (folder) wrap.appendChild(createEl("div", { text: "📁 " + folder, style: { fontWeight: "800", margin: "7px 0 3px" } }));
            for (const item of list.filter(x => x.type === "blob").slice(0, 300)) {
                wrap.appendChild(createEl("div", {
                    text: "📄 " + item.path,
                    style: { fontFamily: "Consolas, monospace", fontSize: "12px", padding: "3px 5px", cursor: "pointer", color: "#334155" },
                    onclick: () => window.Chad.actions.copyRawFile(item.path),
                    oncontextmenu: event => {
                        event.preventDefault();
                        showRepoContextMenu(event.clientX, event.clientY, item.path);
                    }
                }));
            }
        }
    }

    function renderNotes() {
        const wrap = createEl("div", { style: bodyStyle() });
        wrap.appendChild(createEl("div", { text: "Shared notes across all Chad tabs.", style: { color: "#64748b", marginBottom: "7px", fontSize: "11px" } }));
        const textarea = createEl("textarea", { style: { width: "100%", height: "calc(100vh - 220px)", boxSizing: "border-box", resize: "vertical", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "9px", fontFamily: "Consolas, monospace", fontSize: "13px", lineHeight: "1.4", color: "#0f172a", background: "#ffffff", outline: "none" } });
        textarea.value = localStorage.getItem(GLOBAL_NOTES_KEY) || "";
        textarea.addEventListener("input", () => localStorage.setItem(GLOBAL_NOTES_KEY, textarea.value));
        wrap.appendChild(textarea);
        wrap.appendChild(createEl("div", { style: { display: "flex", gap: "5px", marginTop: "8px" } }, [
            button("COPY NOTES", () => window.Chad.actions.copyText(localStorage.getItem(GLOBAL_NOTES_KEY) || ""), { bg: "#e0f2fe", border: "#7dd3fc" }),
            button("CLEAR NOTES", () => { if (!confirm("Clear shared notes?")) return; localStorage.setItem(GLOBAL_NOTES_KEY, ""); render(); }, { bg: "#fee2e2", border: "#fecaca" })
        ]));
        return wrap;
    }

    function menuItem(text, fn) {
        return createEl("div", { text, style: { padding: "7px 9px", cursor: "pointer", borderRadius: "5px", color: "#0f172a" }, onclick: () => { hideRepoContextMenu(); fn(); } });
    }

    function hideRepoContextMenu() {
        if (contextMenu) contextMenu.remove();
        contextMenu = null;
    }

    function showRepoContextMenu(x, y, path) {
        hideRepoContextMenu();
        contextMenu = createEl("div", { style: { position: "fixed", left: x + "px", top: y + "px", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "8px", boxShadow: "0 8px 24px rgba(15,23,42,.22)", zIndex: "1000002", padding: "5px", minWidth: "150px" } }, [
            menuItem("Copy RAW", () => window.Chad.actions.copyRawFile(path)),
            menuItem("Copy URL", () => window.Chad.actions.copyText(window.Chad.actions.fileUrl(path))),
            menuItem("Copy Raw URL", () => window.Chad.actions.copyText(window.Chad.actions.rawUrl(path)))
        ]);
        document.body.appendChild(contextMenu);
    }

    document.addEventListener("click", hideRepoContextMenu, true);

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

    function render() {
        if (!panel) return;
        const state = window.Chad.storage.state;
        applyTabIdentity();
        panel.innerHTML = "";
        panel.appendChild(renderHeader());
        if (body) body.remove();
        if (state.activeTab === "chaties") body = renderChaties();
        else if (state.activeTab === "tasks") body = renderTasks();
        else if (state.activeTab === "roadmap") body = renderRoadmap();
        else if (state.activeTab === "pins") body = renderPins();
        else if (state.activeTab === "repo") body = renderRepo();
        else if (state.activeTab === "notes") body = renderNotes();
        else body = renderTasks();
        panel.appendChild(body);
    }

    function bindAnswerReset() {
        document.addEventListener("keydown", event => {
            const target = event.target;
            const isPrompt = target && (target.id === "prompt-textarea" || target.closest && target.closest("#prompt-textarea"));
            if (isPrompt && event.key === "Enter" && !event.shiftKey && isDoneFlashing()) {
                setTimeout(resetDoneFlash, 300);
            }
        }, true);

        document.addEventListener("click", event => {
            const btn = event.target && event.target.closest && event.target.closest("button");
            if (!btn || !isDoneFlashing()) return;
            const label = (btn.getAttribute("aria-label") || btn.textContent || "").toLowerCase();
            if (label.includes("send") || label.includes("submit")) {
                setTimeout(resetDoneFlash, 300);
            }
        }, true);
    }

    function start() {
        if (document.querySelector("#gandhi-chad-panel")) return;
        window.Chad.storage.state.activeTab = window.Chad.storage.state.activeTab || "chaties";
        panel = createEl("div", { id: "gandhi-chad-panel", style: { position: "fixed", right: "14px", top: "70px", bottom: "14px", width: "410px", background: "#ffffff", color: "#111827", border: "1px solid #cbd5e1", borderRadius: "12px", zIndex: "999999", fontFamily: "Arial, sans-serif", fontSize: "12px", boxShadow: "0 10px 35px rgba(15,23,42,.20)", overflow: "hidden" } });
        document.body.appendChild(panel);
        bindAnswerReset();
        render();
        setTimeout(window.Chad.scanner.scanTasks, 1200);
    }

    ui.createEl = createEl;
    ui.button = button;
    ui.render = render;
    ui.start = start;
    ui.openTextModal = openTextModal;
    ui.openTaskModal = task => openTextModal(task.id + " — " + task.title, task.prompt);
    ui.getAgents = getAgents;
    ui.saveAgents = saveAgents;
    ui.getActiveAgent = getActiveAgent;
    ui.applyTabIdentity = applyTabIdentity;
    ui.markDoneFlash = markDoneFlash;
    ui.resetDoneFlash = resetDoneFlash;
    ui.scanVisibleChatFiles = scanVisibleChatFiles;

    window.Chad.ui = ui;
})();
