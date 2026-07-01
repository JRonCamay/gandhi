window.Chad = window.Chad || {};

(function () {
    "use strict";

    const EXPANDED_KEY = "gandhi_chad_expanded_agent_v2";
    const ACTIVE_KEY = "gandhi_chad_active_agent_id_v1";
    let rendering = false;

    function nowStamp() {
        return new Date().toLocaleString();
    }

    function currentChatUrl() {
        return location.href.includes("/c/")
            ? location.href.split("#")[0]
            : "https://chatgpt.com/";
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function getAgents() {
        return window.Chad.ui && window.Chad.ui.getAgents
            ? window.Chad.ui.getAgents()
            : [];
    }

    function saveAgents(agents) {
        if (window.Chad.ui && window.Chad.ui.saveAgents) {
            window.Chad.ui.saveAgents(agents);
        }
    }

    function getActiveId() {
        return localStorage.getItem(ACTIVE_KEY) || (getAgents()[0] && getAgents()[0].id) || "";
    }

    function setActiveId(id) {
        localStorage.setItem(ACTIVE_KEY, id || "");
    }

    function getExpanded() {
        try {
            return JSON.parse(localStorage.getItem(EXPANDED_KEY) || "{}");
        }
        catch {
            return {};
        }
    }

    function setExpanded(map) {
        localStorage.setItem(EXPANDED_KEY, JSON.stringify(map || {}));
    }

    function isExpanded(id) {
        return Boolean(getExpanded()[id]);
    }

    function toggleExpanded(id) {
        const map = getExpanded();
        map[id] = !map[id];
        setExpanded(map);
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

    function scrollToEnd() {
        setTimeout(() => {
            try {
                const targets = [
                    document.querySelector("main"),
                    document.querySelector("[role='main']"),
                    document.scrollingElement,
                    document.documentElement,
                    document.body
                ].filter(Boolean);
                targets.forEach(target => target.scrollTop = target.scrollHeight);
                window.scrollTo(0, document.body.scrollHeight);
            }
            catch {}
        }, 300);
    }

    function scanTasksSoon() {
        setTimeout(() => {
            if (window.Chad.scanner && window.Chad.scanner.scanTasks) {
                window.Chad.scanner.scanTasks();
            }
        }, 700);
    }

    function openAgent(agent) {
        if (!agent) return;

        setActiveId(agent.id);
        if (window.Chad.ui && window.Chad.ui.applyTabIdentity) {
            window.Chad.ui.applyTabIdentity();
        }

        const here = normalizeUrl(location.href);
        const there = normalizeUrl(agent.chatUrl || "https://chatgpt.com/");

        if (here === there) {
            scrollToEnd();
            scanTasksSoon();
            if (window.Chad.ui && window.Chad.ui.render) window.Chad.ui.render();
            return;
        }

        if (window.Chad.bridge && window.Chad.bridge.openAgentTab) {
            window.Chad.bridge.openAgentTab(agent).catch(() => {
                window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
            });
        }
        else {
            window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
        }

        scrollToEnd();
        scanTasksSoon();
        if (window.Chad.ui && window.Chad.ui.render) window.Chad.ui.render();
    }

    function scanFiles() {
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
                    source: source || "chat",
                    addedAt: nowStamp()
                });
            }
        }

        const ext = "js|txt|md|json|css|html|zip|png|jpg|jpeg|webp|svg|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|csv|mp3|mp4|webm|wav";
        const filePattern = new RegExp("([A-Za-z0-9_./ -]+\\.(?:" + ext + "))", "gi");

        document.querySelectorAll("a[href]").forEach(anchor => {
            const href = anchor.href || "";
            const text = anchor.textContent || "";
            const label = text.trim() || href.split("/").pop() || href;
            if (new RegExp("github\\.com|raw\\.githubusercontent\\.com|sandbox:|\\.(?:" + ext + ")", "i").test(href + " " + text)) {
                addFile(label, href, "link");
            }
        });

        document.querySelectorAll("img[src]").forEach(img => {
            const src = img.src || "";
            if (src) addFile(img.alt || src.split("/").pop() || "image", src, "image");
        });

        document.querySelectorAll("pre, code, p, li, div").forEach(node => {
            const text = node.textContent || "";
            let match;
            while ((match = filePattern.exec(text))) addFile(match[1].trim(), "", "text");
        });

        return Array.from(map.values());
    }

    function mergeAgentFiles(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;

        const found = scanFiles();
        const map = new Map();
        for (const file of agent.files || []) map.set(String(file.url || file.name || file.id).toLowerCase(), file);
        for (const file of found) {
            const key = String(file.url || file.name || file.id).toLowerCase();
            if (!map.has(key)) map.set(key, file);
        }
        agent.files = Array.from(map.values());
        agent.updatedAt = nowStamp();
        saveAgents(agents);
    }

    function btn(label, attrs, style) {
        const data = Object.entries(attrs || {}).map(([k, v]) => `data-${k}="${escapeHTML(v)}"`).join(" ");
        return `<button ${data} style="${style || ""}">${escapeHTML(label)}</button>`;
    }

    function buttonStyle(bg, border, bold) {
        return `background:${bg || "#f8fafc"};border:1px solid ${border || "#cbd5e1"};border-radius:6px;padding:4px 7px;font-size:11px;cursor:pointer;white-space:nowrap;font-weight:${bold ? "700" : "500"};transition:transform .08s ease, filter .08s ease, box-shadow .08s ease;`;
    }

    function renderFile(agent, file) {
        return `
            <div style="border:1px solid #e2e8f0;border-radius:7px;padding:6px;margin-top:5px;background:#fff">
                <div style="font-size:11px;line-height:1.35;margin-bottom:5px">
                    <b>📄 ${escapeHTML(file.name)}</b><br>
                    <span style="color:#64748b">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                    ${file.url ? btn("OPEN", { openfile: file.url }, buttonStyle()) : ""}
                    ${btn("COPY", { copyfile: file.url || file.name }, buttonStyle())}
                    ${btn("DELETE", { deletefile: file.id, agentid: agent.id }, buttonStyle("#fee2e2", "#fecaca"))}
                </div>
            </div>`;
    }

    function renderChaties() {
        const panel = document.querySelector("#gandhi-chad-panel");
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!panel || !state || state.activeTab !== "chaties") return;

        const oldBody = panel.children[1];
        if (!oldBody) return;

        const agents = getAgents();
        const activeId = getActiveId();
        const done = localStorage.getItem("gandhi_chad_task_done_flash_v1");
        const doneLive = Number(done || 0) > Date.now();

        const body = document.createElement("div");
        Object.assign(body.style, {
            padding: "8px",
            overflowY: "auto",
            height: "calc(100vh - 158px)",
            background: "#ffffff"
        });

        body.innerHTML = `
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px">
                <div><b>Chaties</b><br><span style="color:#64748b">Global agents. Arrow expands info without opening tabs.</span></div>
                ${btn("+", { addagent: "1" }, buttonStyle("#dcfce7", "#86efac", true))}
            </div>
            ${agents.map(agent => {
                const active = agent.id === activeId;
                const expanded = isExpanded(agent.id);
                const activeDone = active && doneLive;
                return `
                    <div style="border:1px solid ${activeDone ? "#22c55e" : active ? "#2563eb" : "#cbd5e1"};border-radius:9px;padding:7px;margin-top:6px;background:${activeDone ? "#dcfce7" : active ? "#eff6ff" : "#f8fafc"}">
                        <div style="display:flex;gap:6px;align-items:center">
                            ${btn(expanded ? "▾" : "▸", { toggleagent: agent.id }, buttonStyle("#ffffff", "#cbd5e1", true) + "width:26px")}
                            <button data-openagent="${escapeHTML(agent.id)}" style="flex:1;text-align:left;background:transparent;border:0;padding:3px;cursor:pointer;color:#0f172a;font-weight:700;transition:transform .08s ease, filter .08s ease">
                                ${escapeHTML(agent.icon || "🤖")} ${escapeHTML(agent.name || "Agent")}
                            </button>
                            ${btn("INFO", { editagent: agent.id }, buttonStyle("#fef3c7", "#fcd34d"))}
                        </div>
                        <div style="color:${agent.description ? "#64748b" : "#94a3b8"};font-size:11px;margin-top:3px">${escapeHTML(agent.description || "Click INFO to add description.")}</div>
                        ${expanded ? `
                            <div style="display:flex;gap:4px;flex-wrap:wrap;margin-top:6px">
                                ${btn("SCAN FILES", { scanfiles: agent.id }, buttonStyle("#dcfce7", "#86efac", true))}
                                ${btn("USE THIS CHAT", { usechat: agent.id }, buttonStyle("#e0f2fe", "#7dd3fc"))}
                                ${btn("COPY LINK", { copylink: agent.id }, buttonStyle())}
                                ${btn("DELETE AGENT", { deleteagent: agent.id }, buttonStyle("#fee2e2", "#fecaca"))}
                            </div>
                            <div style="margin-top:6px">
                                ${(agent.files || []).length ? (agent.files || []).map(file => renderFile(agent, file)).join("") : `<div style="color:#64748b;font-size:11px;padding:7px 2px 0">No files yet. Click SCAN FILES.</div>`}
                            </div>` : ""}
                    </div>`;
            }).join("")}`;

        oldBody.replaceWith(body);
        bind(body);
    }

    function editAgent(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;
        const icon = prompt("Icon", agent.icon || "🤖"); if (icon === null) return;
        const name = prompt("Name", agent.name || "Agent"); if (name === null) return;
        const description = prompt("Description", agent.description || ""); if (description === null) return;
        const chatUrl = prompt("Chat URL", agent.chatUrl || "https://chatgpt.com/"); if (chatUrl === null) return;
        const tabTitle = prompt("Tab title", agent.tabTitle || `${icon} ${name}`); if (tabTitle === null) return;
        agent.icon = icon.trim() || "🤖";
        agent.name = name.trim() || "Agent";
        agent.description = description.trim();
        agent.chatUrl = chatUrl.trim() || "https://chatgpt.com/";
        agent.tabTitle = tabTitle.trim() || `${agent.icon} ${agent.name}`;
        agent.updatedAt = nowStamp();
        saveAgents(agents);
    }

    function bind(root) {
        root.addEventListener("click", event => {
            const target = event.target.closest("button");
            if (!target) return;

            const d = target.dataset;
            if (d.toggleagent) {
                toggleExpanded(d.toggleagent);
                renderAll();
                return;
            }
            if (d.openagent) {
                const agent = getAgents().find(item => item.id === d.openagent);
                openAgent(agent);
                return;
            }
            if (d.editagent) {
                editAgent(d.editagent);
                renderAll();
                return;
            }
            if (d.scanfiles) {
                mergeAgentFiles(d.scanfiles);
                renderAll();
                return;
            }
            if (d.usechat) {
                const agents = getAgents();
                const agent = agents.find(item => item.id === d.usechat);
                if (agent) {
                    agent.chatUrl = currentChatUrl();
                    agent.updatedAt = nowStamp();
                    saveAgents(agents);
                    renderAll();
                }
                return;
            }
            if (d.copylink) {
                const agent = getAgents().find(item => item.id === d.copylink);
                if (agent && window.Chad.actions) window.Chad.actions.copyText(agent.chatUrl || "");
                return;
            }
            if (d.deleteagent) {
                const next = getAgents().filter(item => item.id !== d.deleteagent);
                saveAgents(next);
                if (getActiveId() === d.deleteagent) setActiveId(next[0] ? next[0].id : "");
                renderAll();
                return;
            }
            if (d.openfile) window.open(d.openfile, "_blank");
            if (d.copyfile && window.Chad.actions) window.Chad.actions.copyText(d.copyfile);
            if (d.deletefile) {
                const agents = getAgents();
                const agent = agents.find(item => item.id === d.agentid);
                if (agent) {
                    agent.files = (agent.files || []).filter(file => file.id !== d.deletefile);
                    saveAgents(agents);
                    renderAll();
                }
            }
        });
    }

    function addPressFeedback() {
        if (window.__ChadPressFeedbackAdded) return;
        window.__ChadPressFeedbackAdded = true;

        document.addEventListener("mousedown", event => {
            const btn = event.target.closest && event.target.closest("#gandhi-chad-panel button");
            if (!btn) return;
            btn.style.transform = "translateY(1px) scale(.97)";
            btn.style.filter = "brightness(.92)";
            btn.style.boxShadow = "inset 0 2px 4px rgba(15,23,42,.22)";
        }, true);

        function release(event) {
            const btn = event.target.closest && event.target.closest("#gandhi-chad-panel button");
            if (!btn) return;
            btn.style.transform = "";
            btn.style.filter = "";
            btn.style.boxShadow = "";
        }
        document.addEventListener("mouseup", release, true);
        document.addEventListener("mouseleave", release, true);
    }

    function renderAll() {
        if (rendering) return;
        rendering = true;
        if (window.Chad.ui && window.Chad.ui.render) window.Chad.ui.render();
        rendering = false;
        setTimeout(renderChaties, 0);
    }

    function patchUI() {
        if (!window.Chad.ui || window.Chad.ui.__agentFixesPatched) return;
        const original = window.Chad.ui.render;
        window.Chad.ui.render = function () {
            original.apply(window.Chad.ui, arguments);
            setTimeout(renderChaties, 0);
        };
        window.Chad.ui.__agentFixesPatched = true;
    }

    function start() {
        addPressFeedback();
        patchUI();
        setTimeout(renderChaties, 500);
    }

    window.Chad.agentFixes = { renderChaties, scanFiles, scrollToEnd };
    start();
})();
