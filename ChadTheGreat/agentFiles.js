window.Chad = window.Chad || {};

(function () {
    "use strict";

    function nowStamp() {
        return new Date().toLocaleString();
    }

    function scanVisibleChatFiles(agent) {
        const identity = window.Chad.agentIdentity;
        const map = new Map();
        const chatUrl = identity.currentChatUrl();

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
        const identity = window.Chad.agentIdentity;
        const agentUrl = identity.normalizeUrl(agent.chatUrl || "");
        return (agent.files || []).filter(file => file.chatUrl && identity.normalizeUrl(file.chatUrl) === agentUrl);
    }

    function mergeFiles(agentId) {
        const identity = window.Chad.agentIdentity;
        const agents = identity.getAgents();
        const agent = agents.find(item => item.id === agentId);
        if (!agent) return;

        if (!identity.sameUrl(identity.currentChatUrl(), agent.chatUrl || "")) {
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
        identity.saveAgents(agents);
    }

    function renderFile(agent, file, btn, escapeHTML) {
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

    window.Chad.agentFiles = {
        scanVisibleChatFiles,
        visibleFilesForAgent,
        mergeFiles,
        renderFile
    };
})();
