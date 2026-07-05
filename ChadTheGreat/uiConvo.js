window.Chad = window.Chad || {};

(function () {
    "use strict";

    const CHAT_KEY = "gandhi_chad_chat_messages_v1";
    const JAY_FILE_KEY = "gandhi_chad_convo_file_jay_v1";
    const CONVO_FOLDER_KEY = "gandhi_chad_convo_folder_v1";

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function loadJSON(key, fallback) { try { const raw = localStorage.getItem(key); return raw ? (JSON.parse(raw) || fallback) : fallback; } catch { return fallback; } }
    function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
    function loadMessages() { const messages = loadJSON(CHAT_KEY, []); return Array.isArray(messages) ? messages : []; }
    function saveMessages(messages) { saveJSON(CHAT_KEY, messages.slice(-160)); }
    function stamp() { return new Date().toLocaleString(); }
    function timeValue(value) { if (typeof value === "number" && Number.isFinite(value)) return value; if (!value) return 0; const parsed = Date.parse(value); return Number.isFinite(parsed) ? parsed : 0; }

    function sampleMessages(now) {
        const people = [
            ["agent", "👱🏻‍♀️", "Brenda"],
            ["buddy", "🧔", "Shaggy"],
            ["user", "👤", "Jay"],
            ["agent", "🤖", "Chad"],
            ["agent", "🐒", "Monkey Dock"]
        ];
        return Array.from({ length: 30 }, (_, index) => {
            const person = people[index % people.length];
            return {
                id: "sample-" + String(index + 1).padStart(3, "0"),
                role: person[0],
                icon: person[1],
                name: person[2],
                text: index === 0 ? "Convo tab online. Messages display oldest to newest." : "Sample " + (index + 1) + ": Convo history scroll and composer fixed-position test.",
                status: "sample",
                createdAt: new Date(now - ((30 - index) * 60000)).toLocaleString(),
                timestamp: now - ((30 - index) * 60000)
            };
        });
    }

    function seedSampleMessages() {
        const messages = loadMessages();
        const existingIds = new Set(messages.map(message => message && message.id));
        const samples = sampleMessages(Date.now()).filter(message => !existingIds.has(message.id));
        if (!samples.length) return;
        const next = messages.concat(samples).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        saveMessages(next);
        saveConvoFolder(next);
        saveJayConvoFile(next);
    }

    function messageToMarkdown(message) {
        return `## ${message.createdAt || ""}\n${message.icon || ""} ${message.name || message.role || "Unknown"}\n\n${message.text || ""}`;
    }

    function saveJayConvoFile(messages) {
        const jayMessages = messages.filter(message => message.role === "user" || message.name === "Jay");
        saveJSON(JAY_FILE_KEY, { name: "Jay_convo.md", path: "CONVO/Jay_convo.md", updatedAt: stamp(), content: jayMessages.map(messageToMarkdown).join("\n\n") });
    }

    function saveConvoFolder(messages) {
        const sorted = messages.slice(-160).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        saveJSON(CONVO_FOLDER_KEY, { folder: "CONVO", files: { "messages.json": sorted, "messages.md": sorted.map(messageToMarkdown).join("\n\n---\n\n") }, updatedAt: stamp() });
    }

    function addMessage(role, text, status) {
        const now = Date.now();
        const messages = loadMessages();
        const message = { id: "msg-" + now, role, icon: role === "user" ? "👤" : "🤖", name: role === "user" ? "Jay" : "Chad", text, status: status || "saved", createdAt: stamp(), timestamp: now };
        messages.push(message);
        saveMessages(messages);
        saveConvoFolder(messages);
        saveJayConvoFile(messages);
        return message;
    }

    function normalizeMessage(raw, fallback) {
        if (!raw || typeof raw !== "object") return null;
        const text = raw.text || raw.message || raw.content || raw.body || raw.value || "";
        if (!String(text).trim()) return null;
        const role = raw.role || raw.senderRole || raw.type || fallback.role || "buddy";
        const isUser = role === "user" || role === "me" || role === "jay";
        const rawTime = raw.timestamp || raw.createdAt || raw.updatedAt || raw.time || raw.date || fallback.timestamp || 0;
        const ms = timeValue(rawTime) || fallback.index || 0;
        return { id: raw.id || `${fallback.source}-${fallback.index}`, source: fallback.source || "local", role, icon: raw.icon || (isUser ? "👤" : fallback.icon || "🤖"), name: raw.name || raw.sender || raw.author || raw.from || (isUser ? "Jay" : fallback.name || "Buddy"), text: String(text), status: raw.status || "", createdAt: raw.createdAt || raw.time || raw.date || (ms ? new Date(ms).toLocaleString() : ""), timestamp: ms };
    }

    function getDisplayMessages() {
        return loadMessages()
            .map((message, index) => normalizeMessage(message, { source: CHAT_KEY, index, name: message.role === "user" ? "Jay" : "Chad", icon: message.role === "user" ? "👤" : "🤖", timestamp: message.timestamp || message.createdAt }))
            .filter(Boolean)
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    }

    function renderMessage(message) {
        const isUser = message.role === "user" || message.name === "Jay";
        const timestamp = message.createdAt || (message.timestamp ? new Date(message.timestamp).toLocaleString() : "");
        return el("div", { style: { border: "1px solid " + (isUser ? "#bfdbfe" : "#e2e8f0"), borderRadius: "9px", padding: "7px", marginBottom: "7px", background: isUser ? "#eff6ff" : "#f8fafc" } }, [
            el("div", { html: `${esc(message.icon || "🤖")} <b>${esc(message.name || "Agent")}:</b> ${esc(message.text || "")}`, style: { whiteSpace: "pre-wrap", lineHeight: "1.35", color: "#0f172a" } }),
            el("div", { text: timestamp, style: { color: "#64748b", fontSize: "10px", marginTop: "4px", paddingLeft: "22px" } })
        ]);
    }

    function renderConvo() {
        const parentColumn = el("div", { style: { position: "relative", height: "100%", minHeight: "360px", overflow: "hidden", background: "#ffffff" } });
        const list = el("div", { style: { position: "absolute", left: "0", right: "0", top: "0", bottom: "64px", overflowY: "auto", overflowX: "hidden", padding: "8px", paddingRight: "12px", boxSizing: "border-box" } });
        const messages = getDisplayMessages();
        list.appendChild(el("div", { html: "<b>Convo Chat History</b><br><span style='color:#64748b'>SEND saves here and into the CONVO folder store.</span>", style: { marginBottom: "8px", lineHeight: "1.35" } }));
        if (!messages.length) list.appendChild(el("div", { text: "No local messages yet.", style: { color: "#64748b", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px" } }));
        else messages.forEach(message => list.appendChild(renderMessage(message)));

        const input = el("textarea", { placeholder: "Message as Jay...", style: { flex: "1 1 auto", width: "100%", height: "44px", minHeight: "44px", maxHeight: "44px", resize: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px", fontSize: "12px", lineHeight: "1.35", outline: "none", boxSizing: "border-box" } });
        function send() {
            const text = input.value.trim();
            if (!text) return;
            addMessage("user", text, "saved");
            input.value = "";
            ui().render();
        }
        input.addEventListener("keydown", event => { event.stopPropagation(); if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } });
        ["pointerdown", "mousedown", "click", "focusin", "input"].forEach(type => input.addEventListener(type, event => event.stopPropagation()));
        const inputRow = el("div", { style: { position: "absolute", left: "0", right: "0", bottom: "0", height: "64px", zIndex: "5", borderTop: "1px solid #e2e8f0", padding: "8px", display: "flex", flexDirection: "row", gap: "6px", alignItems: "flex-end", background: "#f8fafc", boxSizing: "border-box" } }, [input, btn("SEND", send, { bg: "#2563eb", border: "#2563eb", color: "#ffffff", bold: true, padding: "9px 10px" })]);
        parentColumn.appendChild(list);
        parentColumn.appendChild(inputRow);
        requestAnimationFrame(() => { list.scrollTop = list.scrollHeight; });
        return parentColumn;
    }

    seedSampleMessages();
    window.Chad.uiConvo = {
        render: renderConvo,
        addMessage,
        getDisplayMessages,
        loadLocalBuddyMessages: () => [],
        seedSampleMessages,
        getConvoFolder: () => loadJSON(CONVO_FOLDER_KEY, { folder: "CONVO", files: {}, updatedAt: "" }),
        getJayConvoFile: () => loadJSON(JAY_FILE_KEY, { name: "Jay_convo.md", path: "CONVO/Jay_convo.md", content: "", updatedAt: "" })
    };
})();
