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
    function saveMessages(messages) { saveJSON(CHAT_KEY, messages.slice(-120)); }
    function stamp() { return new Date().toLocaleString(); }
    function timeValue(value) { if (typeof value === "number" && Number.isFinite(value)) return value; if (!value) return 0; const parsed = Date.parse(value); return Number.isFinite(parsed) ? parsed : 0; }

    function sampleMessages(now) {
        return [
            { id: "sample-001", role: "agent", icon: "👱🏻‍♀️", name: "Brenda", text: "Convo tab online. Messages display oldest to newest.", status: "sample", createdAt: new Date(now - 780000).toLocaleString(), timestamp: now - 780000 },
            { id: "sample-002", role: "buddy", icon: "🧔", name: "Shaggy", text: "Chaties keeps agents. Convo keeps messages.", status: "sample", createdAt: new Date(now - 720000).toLocaleString(), timestamp: now - 720000 },
            { id: "sample-003", role: "user", icon: "👤", name: "Jay", text: "Testing Jay convo-file save.", status: "sample", createdAt: new Date(now - 660000).toLocaleString(), timestamp: now - 660000 },
            { id: "sample-004", role: "agent", icon: "👱🏻‍♀️", name: "Brenda", text: "Sample 4: scrollbar test line. The list should stay inside the Chad panel.", status: "sample", createdAt: new Date(now - 600000).toLocaleString(), timestamp: now - 600000 },
            { id: "sample-005", role: "buddy", icon: "🧔", name: "Shaggy", text: "Sample 5: switching tabs should not hide the Convo button.", status: "sample", createdAt: new Date(now - 540000).toLocaleString(), timestamp: now - 540000 },
            { id: "sample-006", role: "user", icon: "👤", name: "Jay", text: "Sample 6: clicking this input should keep focus here.", status: "sample", createdAt: new Date(now - 480000).toLocaleString(), timestamp: now - 480000 },
            { id: "sample-007", role: "agent", icon: "🤖", name: "Chad", text: "Sample 7: local message storage is active.", status: "sample", createdAt: new Date(now - 420000).toLocaleString(), timestamp: now - 420000 },
            { id: "sample-008", role: "buddy", icon: "🤝", name: "Buddy", text: "Sample 8: this message helps force overflow for the scrollbar.", status: "sample", createdAt: new Date(now - 360000).toLocaleString(), timestamp: now - 360000 },
            { id: "sample-009", role: "agent", icon: "👱🏻‍♀️", name: "Brenda", text: "Sample 9: scrollbar should appear on the right side of the message list.", status: "sample", createdAt: new Date(now - 300000).toLocaleString(), timestamp: now - 300000 },
            { id: "sample-010", role: "user", icon: "👤", name: "Jay", text: "Sample 10: SEND should add a new Jay message below these samples.", status: "sample", createdAt: new Date(now - 240000).toLocaleString(), timestamp: now - 240000 },
            { id: "sample-011", role: "agent", icon: "🐒", name: "GitGit", text: "Sample 11: bottom dock can use the same Convo folder later.", status: "sample", createdAt: new Date(now - 180000).toLocaleString(), timestamp: now - 180000 },
            { id: "sample-012", role: "buddy", icon: "🧔", name: "Shaggy", text: "Sample 12: more content, more scroll testing.", status: "sample", createdAt: new Date(now - 120000).toLocaleString(), timestamp: now - 120000 },
            { id: "sample-013", role: "agent", icon: "👱🏻‍♀️", name: "Brenda", text: "Sample 13: end of seeded test messages.", status: "sample", createdAt: new Date(now - 60000).toLocaleString(), timestamp: now - 60000 }
        ];
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

    function isInsideChadPanel(element) { return !!(element && element.closest && element.closest("#gandhi-chad-panel")); }

    function findPromptBox() {
        const candidates = Array.from(document.querySelectorAll("#prompt-textarea, textarea[data-id='root'], [contenteditable='true'], textarea"));
        return candidates.find(element => !isInsideChadPanel(element)) || null;
    }

    function setNativeValue(element, value) {
        const proto = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : element instanceof HTMLInputElement ? HTMLInputElement.prototype : null;
        if (proto) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
            if (descriptor && descriptor.set) descriptor.set.call(element, value);
            else element.value = value;
        }
        else element.textContent = value;
        element.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
    }

    function clickMainSendButton() {
        const buttons = Array.from(document.querySelectorAll("button"));
        const sendButton = buttons.find(btn => {
            if (isInsideChadPanel(btn)) return false;
            const label = (btn.getAttribute("aria-label") || btn.textContent || "").toLowerCase();
            return !btn.disabled && (label.includes("send") || label.includes("submit"));
        });
        if (sendButton) { sendButton.click(); return true; }
        return false;
    }

    function sendToMainChat(text) {
        const prompt = findPromptBox();
        if (!prompt) { if (window.Chad.actions && window.Chad.actions.copyText) window.Chad.actions.copyText(text); return false; }
        prompt.focus();
        setNativeValue(prompt, text);
        setTimeout(() => {
            if (!clickMainSendButton()) prompt.dispatchEvent(new KeyboardEvent("keydown", { bubbles: true, cancelable: true, key: "Enter", code: "Enter" }));
        }, 60);
        return true;
    }

    function messageToMarkdown(message) {
        return `## ${message.createdAt || ""}\n${message.icon || ""} ${message.name || message.role || "Unknown"}\n\n${message.text || ""}`;
    }

    function saveJayConvoFile(messages) {
        const jayMessages = messages.filter(message => message.role === "user" || message.name === "Jay");
        const content = jayMessages.map(messageToMarkdown).join("\n\n");
        saveJSON(JAY_FILE_KEY, { name: "Jay_convo.md", path: "CONVO/Jay_convo.md", updatedAt: stamp(), content });
    }

    function saveConvoFolder(messages) {
        const sorted = messages.slice(-120).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
        saveJSON(CONVO_FOLDER_KEY, {
            folder: "CONVO",
            files: {
                "messages.json": sorted,
                "messages.md": sorted.map(messageToMarkdown).join("\n\n---\n\n")
            },
            updatedAt: stamp()
        });
    }

    function addMessage(role, text, status) {
        const now = Date.now();
        const messages = loadMessages();
        const message = { id: "msg-" + now, role, icon: role === "user" ? "👤" : "🤖", name: role === "user" ? "Jay" : "Chad", text, status: status || "sent", createdAt: stamp(), timestamp: now };
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
        const icon = raw.icon || raw.pic || raw.avatar || raw.emoji || (isUser ? "👤" : fallback.icon || "🤖");
        const name = raw.name || raw.agentName || raw.sender || raw.author || raw.from || (isUser ? "Jay" : fallback.name || "Buddy");
        const rawTime = raw.timestamp || raw.createdAt || raw.updatedAt || raw.time || raw.date || fallback.timestamp || 0;
        const ms = timeValue(rawTime) || fallback.index || 0;
        return { id: raw.id || `${fallback.source}-${fallback.index}`, source: fallback.source || "local", role, icon, name, text: String(text), status: raw.status || "", createdAt: raw.createdAt || raw.time || raw.date || (ms ? new Date(ms).toLocaleString() : ""), timestamp: ms };
    }

    function collectMessageObjects(value, bucket, source, depth) {
        if (!value || depth > 4) return;
        if (Array.isArray(value)) { value.forEach(item => collectMessageObjects(item, bucket, source, depth + 1)); return; }
        if (typeof value !== "object") return;
        const maybe = normalizeMessage(value, { source, index: bucket.length + 1, name: source.includes("buddy") ? "Buddy" : "Chad", icon: source.includes("buddy") ? "🤝" : "🤖" });
        if (maybe) bucket.push(maybe);
        ["messages", "chats", "history", "items", "threads", "records"].forEach(key => { if (value[key]) collectMessageObjects(value[key], bucket, source, depth + 1); });
    }

    function loadLocalBuddyMessages() {
        const messages = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || "";
            const lower = key.toLowerCase();
            const looksRelevant = lower.includes("buddy") || lower.includes("buddies") || lower.includes("local") || lower.includes("agent_chat");
            if (!looksRelevant || key === CHAT_KEY || key === JAY_FILE_KEY || key === CONVO_FOLDER_KEY) continue;
            try { collectMessageObjects(JSON.parse(localStorage.getItem(key)), messages, key, 0); } catch {}
        }
        return messages;
    }

    function getDisplayMessages() {
        const own = loadMessages().map((message, index) => normalizeMessage(message, { source: CHAT_KEY, index, name: message.role === "user" ? "Jay" : "Chad", icon: message.role === "user" ? "👤" : "🤖", timestamp: message.timestamp || message.createdAt })).filter(Boolean);
        const map = new Map();
        own.concat(loadLocalBuddyMessages()).forEach((message, index) => {
            const key = `${message.source}|${message.id}|${message.text}|${message.timestamp || index}`;
            if (!map.has(key)) map.set(key, message);
        });
        return Array.from(map.values()).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")));
    }

    function renderMessage(message) {
        const isUser = message.role === "user" || message.name === "Jay";
        const timestamp = message.createdAt || (message.timestamp ? new Date(message.timestamp).toLocaleString() : "");
        return el("div", { style: { border: "1px solid " + (isUser ? "#bfdbfe" : "#e2e8f0"), borderRadius: "9px", padding: "7px", marginBottom: "7px", background: isUser ? "#eff6ff" : "#f8fafc" } }, [
            el("div", { html: `${esc(message.icon || "🤖")} <b>${esc(message.name || "Agent")}:</b> ${esc(message.text || "")}`, style: { whiteSpace: "pre-wrap", lineHeight: "1.35", color: "#0f172a" } }),
            el("div", { text: timestamp, style: { color: "#64748b", fontSize: "10px", marginTop: "4px", paddingLeft: "22px" } }),
            message.status === "copied" ? el("div", { text: "Prompt box not found. Message saved to CONVO and copied instead.", style: { color: "#ca8a04", fontSize: "11px", marginTop: "5px", paddingLeft: "22px" } }) : null
        ]);
    }

    function renderConvo() {
        const parentColumn = el("div", { style: { height: "100%", minHeight: "0", overflow: "hidden", background: "#ffffff", display: "flex", flexDirection: "column" } });
        const fixedColumn = el("div", { style: { flex: "1 1 auto", minHeight: "0", overflow: "hidden", display: "flex", flexDirection: "column" } });
        const messageRow = el("div", { style: { flex: "1 1 auto", minHeight: "0", overflow: "hidden", display: "flex", paddingRight: "2px" } });
        const list = el("div", { style: { flex: "1 1 auto", minWidth: "0", minHeight: "0", height: "100%", overflowY: "scroll", overflowX: "hidden", scrollbarGutter: "stable", padding: "8px", paddingRight: "12px", boxSizing: "border-box" } });
        const messages = getDisplayMessages();
        list.appendChild(el("div", { html: "<b>Convo</b><br><span style='color:#64748b'>Conversation messages only. SEND saves to the CONVO folder store.</span>", style: { marginBottom: "8px", lineHeight: "1.35" } }));
        if (!messages.length) list.appendChild(el("div", { text: "No local messages yet.", style: { color: "#64748b", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px" } }));
        else messages.forEach(message => list.appendChild(renderMessage(message)));
        messageRow.appendChild(list);

        const input = el("textarea", { placeholder: "Message as Jay...", style: { flex: "1 1 auto", width: "100%", height: "44px", minHeight: "44px", maxHeight: "88px", resize: "vertical", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px", fontSize: "12px", lineHeight: "1.35", outline: "none", boxSizing: "border-box" } });
        function send() {
            const text = input.value.trim();
            if (!text) return;
            const sent = sendToMainChat(text);
            addMessage("user", text, sent ? "sent" : "copied");
            input.value = "";
            ui().render();
        }
        input.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } });
        const inputRow = el("div", { style: { flex: "0 0 auto", borderTop: "1px solid #e2e8f0", padding: "8px", display: "flex", flexDirection: "row", gap: "6px", alignItems: "flex-end", background: "#f8fafc", boxSizing: "border-box" } }, [input, btn("SEND", send, { bg: "#2563eb", border: "#2563eb", color: "#ffffff", bold: true, padding: "9px 10px" })]);
        fixedColumn.appendChild(messageRow);
        fixedColumn.appendChild(inputRow);
        parentColumn.appendChild(fixedColumn);
        setTimeout(() => { list.scrollTop = list.scrollHeight; }, 0);
        return parentColumn;
    }

    seedSampleMessages();
    window.Chad.uiConvo = {
        render: renderConvo,
        addMessage,
        sendToMainChat,
        getDisplayMessages,
        loadLocalBuddyMessages,
        seedSampleMessages,
        getConvoFolder: () => loadJSON(CONVO_FOLDER_KEY, { folder: "CONVO", files: {}, updatedAt: "" }),
        getJayConvoFile: () => loadJSON(JAY_FILE_KEY, { name: "Jay_convo.md", path: "CONVO/Jay_convo.md", content: "", updatedAt: "" })
    };
})();
