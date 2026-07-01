window.Chad = window.Chad || {};

(function () {
    "use strict";

    const ACTIVE_KEY = "gandhi_chad_active_agent_id_v1";
    const EXPANDED_KEY = "gandhi_chad_expanded_agent_v3";
    const DONE_KEY = "gandhi_chad_task_done_flash_v1";
    const GLOBAL_AGENTS_KEY = "gandhi_chad_global_agents_v1";
    const DOCK_ID = "gandhi-chad-monkey-dock";

    let lastChatiesSignature = "";

    const PRESS_LABELS = new Set([
        "SCAN FILES", "USE THIS CHAT", "COPY LINK", "DELETE AGENT", "INFO",
        "MAIN", "PAINT", "GITGIT", "UPDATE", "🔄 UPDATE",
        "TASK RULES", "GOD RULES", "SCAN TAB", "SCAN", "Scan",
        "ROADMAP", "PINS"
    ]);
    function nowStamp() {
        return new Date().toLocaleString();
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

    function currentChatUrl() {
        return location.href.includes("/c/")
            ? location.href.split("#")[0]
            : "https://chatgpt.com/";
    }

    function sameUrl(a, b) {
        return normalizeUrl(a) === normalizeUrl(b);
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getAgents() {
        if (window.Chad.ui && window.Chad.ui.getAgents) {
            return window.Chad.ui.getAgents();
        }
        return loadJSON(GLOBAL_AGENTS_KEY, []);
    }

    function saveAgents(agents) {
        if (window.Chad.ui && window.Chad.ui.saveAgents) {
            window.Chad.ui.saveAgents(agents);
            return;
        }
        saveJSON(GLOBAL_AGENTS_KEY, agents);
    }

    function getActiveId() {
        const here = currentChatUrl();
        const match = getAgents().find(agent => agent.chatUrl && sameUrl(agent.chatUrl, here));
        if (match) {
            localStorage.setItem(ACTIVE_KEY, match.id);
            return match.id;
        }
        return localStorage.getItem(ACTIVE_KEY) || (getAgents()[0] && getAgents()[0].id) || "";
    }
    function setActiveId(id) {
        localStorage.setItem(ACTIVE_KEY, id || "");
    }

    function getExpandedMap() {
        return loadJSON(EXPANDED_KEY, {});
    }

    function setExpandedMap(map) {
        saveJSON(EXPANDED_KEY, map || {});
    }

    function isExpanded(id) {
        return Boolean(getExpandedMap()[id]);
    }

    function toggleExpanded(id) {
        const map = getExpandedMap();
        map[id] = !map[id];
        setExpandedMap(map);
    }

    function setExpanded(id, value) {
        const map = getExpandedMap();
        map[id] = Boolean(value);
        setExpandedMap(map);
    }

    function syncActiveAgentToCurrentUrl() {
        const here = currentChatUrl();
        const agents = getAgents();
        const match = agents.find(agent => agent.chatUrl && sameUrl(agent.chatUrl, here));

        if (match && getActiveId() !== match.id) {
            setActiveId(match.id);
            setExpanded(match.id, true);
            if (window.Chad.ui && window.Chad.ui.applyTabIdentity) {
                window.Chad.ui.applyTabIdentity();
            }
            if (window.Chad.storage && window.Chad.storage.state && window.Chad.storage.state.activeTab === "chaties") {
                renderChatiesStable(true);
            }
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
        }, 250);
    }

    function openAgent(agent) {
        if (!agent) return;

        setActiveId(agent.id);
        setExpanded(agent.id, true);

        if (sameUrl(location.href, agent.chatUrl || "")) {
            scrollToEnd();
            if (window.Chad.ui && window.Chad.ui.applyTabIdentity) window.Chad.ui.applyTabIdentity();
            renderChatiesStable(true);
            return;
        }

        if (window.Chad.bridge && window.Chad.bridge.openAgentTab) {
            window.Chad.bridge.openAgentTab(agent).catch(() => {
                window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
            });
        }

        renderChatiesStable(true);
    }

    function scanVisibleChatFiles(agent) {
        const map = new Map();
        const chatUrl = currentChatUrl();

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
                    chatUrl,
                    addedAt: nowStamp()
                });
            }
        }

        const ext = "png|jpg|jpeg|webp|gif|pdf|js|txt|md|json|zip";
        const extRegex = new RegExp("\\.(?:" + ext + ")", "i");
        const filePattern = new RegExp("([A-Za-z0-9_./ -]+\\.(?:" + ext + "))", "gi");

        document.querySelectorAll("a[href]").forEach(anchor => {
            const href = anchor.href || "";
            const text = anchor.textContent || "";
            const label = text.trim() || href.split("/").pop() || href;
            if (/github\.com|raw\.githubusercontent\.com|sandbox:/i.test(href) || extRegex.test(href) || extRegex.test(text)) {
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

        return Array.from(map.values()).map(file => ({ ...file, chatUrl: agent.chatUrl || chatUrl }));
    }

    function visibleFilesForAgent(agent) {
        const agentUrl = normalizeUrl(agent.chatUrl || "");
        return (agent.files || []).filter(file => file.chatUrl && normalizeUrl(file.chatUrl) === agentUrl);
    }

    function mergeFiles(agentId) {
        const agents = getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;

        if (!sameUrl(currentChatUrl(), agent.chatUrl || "")) {
            if (window.Chad.ui && window.Chad.ui.openTextModal) {
                window.Chad.ui.openTextModal("Open Agent Chat First", "Open this agent's chat first, then scan files.");
            }
            return;
        }

        const found = scanVisibleChatFiles(agent);
        const map = new Map();
        for (const file of visibleFilesForAgent(agent)) map.set(String(file.url || file.name || file.id).toLowerCase(), file);
        for (const file of found) map.set(String(file.url || file.name || file.id).toLowerCase(), file);
        agent.files = Array.from(map.values());
        agent.updatedAt = nowStamp();
        saveAgents(agents);
    }

    function btn(label, attrs, bg, border, bold, press) {
        const data = Object.entries(attrs || {}).map(([k, v]) => `data-${k}="${escapeHTML(v)}"`).join(" ");
        return `<button ${data} ${press ? "data-press='1'" : ""} style="background:${bg || "#f8fafc"};border:1px solid ${border || "#cbd5e1"};border-radius:6px;padding:4px 7px;font-size:11px;cursor:pointer;white-space:nowrap;font-weight:${bold ? "700" : "500"};transition:transform .08s ease,filter .08s ease,box-shadow .08s ease">${escapeHTML(label)}</button>`;
    }

    function renderFile(agent, file) {
        return `
            <div style="border:1px solid #e2e8f0;border-radius:7px;padding:6px;margin-top:5px;background:#fff">
                <div style="font-size:11px;line-height:1.35;margin-bottom:5px">
                    <b>📄 ${escapeHTML(file.name)}</b><br>
                    <span style="color:#64748b">${escapeHTML(file.source || "chat")} · ${escapeHTML(file.addedAt || "")}</span>
                </div>
                <div style="display:flex;gap:4px;flex-wrap:wrap">
                    ${file.url ? btn("OPEN", { openfile: file.url }, "#f8fafc", "#cbd5e1", false, false) : ""}
                    ${btn("COPY", { copyfile: file.url || file.name }, "#f8fafc", "#cbd5e1", false, false)}
                    ${btn("DELETE", { deletefile: file.id, agentid: agent.id }, "#fee2e2", "#fecaca", false, false)}
                </div>
            </div>`;
    }

    function renderChatiesStable(force) {
        const panel = document.querySelector("#gandhi-chad-panel");
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!panel || !state || state.activeTab !== "chaties") return;

        const oldBody = panel.children[1];
        if (!oldBody) return;

        const agents = getAgents();
        const activeId = getActiveId();
        const doneLive = Number(localStorage.getItem(DONE_KEY) || 0) > Date.now();
        const expandedMap = getExpandedMap();
        const signature = JSON.stringify({
            activeId,
            doneLive,
            expandedMap,
            agents: agents.map(a => [a.id, a.name, a.icon, a.description, a.chatUrl, (visibleFilesForAgent(a) || []).length])
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
                const expanded = isExpanded(agent.id);
                const files = visibleFilesForAgent(agent);
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
                            </div>
                            <div style="margin-top:6px">
                                ${files.length ? files.map(file => renderFile(agent, file)).join("") : `<div style="color:#64748b;font-size:11px;padding:7px 2px 0">No files for this agent chat yet.</div>`}
                            </div>` : ""}
                    </div>`;
            }).join("")}`;

        oldBody.replaceWith(body);
        bindChaties(body);
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
        Object.assign(agent, {
            icon: icon.trim() || "🤖",
            name: name.trim() || "Agent",
            description: description.trim(),
            chatUrl: chatUrl.trim() || "https://chatgpt.com/",
            tabTitle: tabTitle.trim() || `${icon} ${name}`,
            updatedAt: nowStamp()
        });
        saveAgents(agents);
    }

    function bindChaties(root) {
        root.addEventListener("click", event => {
            const target = event.target.closest("button");
            if (!target) return;
            const d = target.dataset;

            if (d.toggleagent) { toggleExpanded(d.toggleagent); renderChatiesStable(true); return; }
            if (d.openagent) { openAgent(getAgents().find(a => a.id === d.openagent)); return; }
            if (d.editagent) { editAgent(d.editagent); renderChatiesStable(true); return; }
            if (d.scanfiles) { mergeFiles(d.scanfiles); renderChatiesStable(true); return; }
            if (d.usechat) {
                const agents = getAgents();
                const agent = agents.find(a => a.id === d.usechat);
                if (agent) {
                    agent.chatUrl = currentChatUrl();
                    agent.updatedAt = nowStamp();
                    saveAgents(agents);
                    setActiveId(agent.id);
                    setExpanded(agent.id, true);
                    if (window.Chad.ui && window.Chad.ui.applyTabIdentity) window.Chad.ui.applyTabIdentity();
                    renderChatiesStable(true);
                }
                return;
            }
            if (d.copylink) {
                const agent = getAgents().find(a => a.id === d.copylink);
                if (agent && window.Chad.actions) window.Chad.actions.copyText(agent.chatUrl || "");
                return;
            }
            if (d.deleteagent) {
                const next = getAgents().filter(a => a.id !== d.deleteagent);
                saveAgents(next);
                if (getActiveId() === d.deleteagent) setActiveId(next[0] ? next[0].id : "");
                renderChatiesStable(true);
                return;
            }
            if (d.openfile) window.open(d.openfile, "_blank");
            if (d.copyfile && window.Chad.actions) window.Chad.actions.copyText(d.copyfile);
            if (d.deletefile) {
                const agents = getAgents();
                const agent = agents.find(a => a.id === d.agentid);
                if (agent) {
                    agent.files = (agent.files || []).filter(file => file.id !== d.deletefile);
                    saveAgents(agents);
                    renderChatiesStable(true);
                }
            }
        });
    }

    function addPressFeedback() {
        if (window.__ChadSelectivePressFeedbackAddedV3) return;
        window.__ChadSelectivePressFeedbackAddedV3 = true;

        function shouldPress(btn) {
            if (!btn || !btn.closest("#gandhi-chad-panel")) return false;
            if (btn.dataset && btn.dataset.press === "1") return true;
            const state = window.Chad.storage && window.Chad.storage.state;
            if (state && (state.activeTab === "pins" || state.activeTab === "repo")) return true;
            const text = (btn.textContent || "").trim();
            return PRESS_LABELS.has(text) || PRESS_LABELS.has(text.toUpperCase());
        }

        function release(btn) {
            if (!btn) return;
            btn.style.transform = "";
            btn.style.filter = "";
            btn.style.boxShadow = "";
        }

        document.addEventListener("mousedown", event => {
            const btn = event.target.closest && event.target.closest("button");
            if (!shouldPress(btn)) return;
            btn.style.transform = "translateY(1px) scale(.97)";
            btn.style.filter = "brightness(.92)";
            btn.style.boxShadow = "inset 0 2px 4px rgba(15,23,42,.22)";
        }, true);

        document.addEventListener("mouseup", event => release(event.target.closest && event.target.closest("button")), true);
    }

    function ensureDock() {
        let dock = document.querySelector("#" + DOCK_ID);
        if (!dock) {
            dock = document.createElement("button");
            dock.id = DOCK_ID;
            dock.textContent = "🐒";
            dock.title = "Open Chad";
            Object.assign(dock.style, {
                position: "fixed",
                right: "18px",
                bottom: "18px",
                zIndex: "999998",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "2px solid #fcd34d",
                background: "#fef3c7",
                fontSize: "24px",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(15,23,42,.25)",
                display: "none"
            });
            dock.addEventListener("click", () => {
                const panel = document.querySelector("#gandhi-chad-panel");
                if (panel) panel.style.display = "block";
                dock.style.display = "none";
                renderChatiesStable(true);
            });
            document.body.appendChild(dock);
        }
        return dock;
    }

    function showDock() {
        ensureDock().style.display = "block";
    }

    function patchCloseButton() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;
        const close = Array.from(panel.querySelectorAll("button")).find(btn => btn.textContent.trim() === "✕");
        if (!close || close.dataset.chadDockClose === "1") return;
        close.dataset.chadDockClose = "1";
        close.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            panel.style.display = "none";
            showDock();
        };
    }

    function tick() {
        syncActiveAgentToCurrentUrl();
        patchCloseButton();
        const state = window.Chad.storage && window.Chad.storage.state;
        if (state && state.activeTab === "chaties") renderChatiesStable(false);
    }

    function start() {
        addPressFeedback();
        ensureDock();
        setInterval(tick, 600);
        setTimeout(tick, 300);
        setTimeout(tick, 1200);
    }

    window.Chad.agentFixes = { renderChatiesStable, scrollToEnd, syncActiveAgentToCurrentUrl, showDock };
    start();
})();
