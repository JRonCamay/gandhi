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
        const base = [
            ["agent", "👱🏻‍♀️", "Brenda", "Convo tab online. Messages display oldest to newest."],
            ["buddy", "🧔", "Shaggy", "Chaties keeps agents. Convo keeps messages."],
            ["user", "👤", "Jay", "Testing Jay convo-file save."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 4: scrollbar test line. The list should stay inside the Chad panel."],
            ["buddy", "🧔", "Shaggy", "Sample 5: switching tabs should not hide the Convo button."],
            ["user", "👤", "Jay", "Sample 6: clicking this input should keep focus here."],
            ["agent", "🤖", "Chad", "Sample 7: local message storage is active."],
            ["buddy", "🤝", "Buddy", "Sample 8: this message helps force overflow for the scrollbar."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 9: scrollbar should appear on the right side of the message list."],
            ["user", "👤", "Jay", "Sample 10: SEND should add a new Jay message below these samples."],
            ["agent", "🐒", "GitGit", "Sample 11: bottom dock can use the same Convo folder later."],
            ["buddy", "🧔", "Shaggy", "Sample 12: more content, more scroll testing."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 13: end of first seeded test batch."],
            ["user", "👤", "Jay", "Sample 14: this should appear under the Convo chat history window."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 15: added extra history for visual testing."],
            ["buddy", "🧔", "Shaggy", "Sample 16: enough messages should force the internal scrollbar."],
            ["agent", "🤖", "Chad", "Sample 17: click the textarea after this and focus should stay in Chad."],
            ["user", "👤", "Jay", "Sample 18: pressing Enter saves; Shift+Enter makes a newline."],
            ["agent", "🐒", "GitGit", "Sample 19: Convo folder storage should update after SEND."],
            ["buddy", "🤝", "Buddy", "Sample 20: testing long history window behavior."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 21: message history still sorted oldest to newest."],
            ["user", "👤", "Jay", "Sample 22: this is another Jay test line."],
            ["agent", "🤖", "Chad", "Sample 23: sample batch continues below the fold."],
            ["buddy", "🧔", "Shaggy", "Sample 24: near the bottom of seeded history."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 25: final seeded sample for Convo history."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 26: extra visible message under the chat history window."],
            ["user", "👤", "Jay", "Sample 27: more Jay-side history for testing."],
            ["agent", "🐒", "GitGit", "Sample 28: bottom of the extended test set."],
            ["buddy", "🤝", "Buddy", "Sample 29: scroll test continues."],
            ["agent", "👱🏻‍♀️", "Brenda", "Sample 30: end of expanded Convo samples."]
        ];
        return base.map((item, index) => ({
            id: "sample-" + String(index + 1).padStart(3, "0"),
            role: item[0], icon: item[1], name: item[2], text: item[3], status: "sample",
            createdAt: new Date(now - ((base.length - index) * 60000)).toLocaleString(),
            timestamp: now - ((base.length - index) * 60000)
        }));
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
        const content = jayMessages.map(messageToMarkdown).join("\n\n");
        saveJSON(JAY_FILE_KEY, { name: "Jay_convo.md", path: "CONVO/Jay_convo.md", updatedAt: stamp(), content });
    }

    function saveConvoFolder(messages) {
        const sorted = messages.slice(-160).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
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
        const message = { id: "msg-" + now, role, icon: role === "user" ? "👤" : "🤖", name: role === "user" ? "Jay" : "Chad", text, status: status || "saved", createdAt: stamp(), timestamp: now };
        messages.push(message);
        saveMessages(messages);
        saveConvoFolder(messages);
        saveJayConvoFile(messages);
        return message;
    }

    function timeSort(a, b) { return (a.timestamp || 0) - (b.timestamp || 0) || String(a.createdAt || "").localeCompare(String(b.createdAt || "")); }

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
        return Array.from(map.values()).sort(timeSort);
    }

    function renderMessage(message) {
        const isUser = message.role === "user" || message.name === "Jay";
        const timestamp = message.createdAt || (message.timestamp ? new Date(message.timestamp).toLocaleString() : "");
        return el("div", { style: { border: "1px solid " + (isUser ? "#bfdbfe" : "#e2e8f0"), borderRadius: "9px", padding: "7px", marginBottom: "7px", background: isUser ? "#eff6ff" : "#f8fafc" } }, [
            el("div", { html: `${esc(message.icon || "🤖")} <b>${esc(message.name || "Agent")}:</b> ${esc(message.text || "")}`, style: { whiteSpace: "pre-wrap", lineHeight: "1.35", color: "#0f172a" } }),
            el("div", { text: timestamp, style: { color: "#64748b", fontSize: "10px", marginTop: "4px", paddingLeft: "22px" } })
        ]);
    }

    function protectConvoInput(input) {
        input.dataset.chadConvoInput = "1";
        const keepFocus = event => {
            event.stopPropagation();
            setTimeout(() => { if (document.activeElement !== input) input.focus(); }, 0);
        };
        ["pointerdown", "mousedown", "mouseup", "click", "dblclick", "focus", "focusin", "keydown", "keyup", "input", "beforeinput"].forEach(type => {
            input.addEventListener(type, keepFocus, true);
            input.addEventListener(type, event => event.stopPropagation(), false);
        });
    }

    function renderConvo() {
        const parentColumn = el("div", { style: { height: "100%", maxHeight: "100%", minHeight: "0", overflow: "hidden", background: "#ffffff", display: "flex", flexDirection: "column", position: "relative" } });
        const messageRow = el("div", { style: { flex: "1 1 0", minHeight: "0", overflow: "hidden", display: "flex", paddingRight: "2px" } });
        const list = el("div", { style: { flex: "1 1 auto", minWidth: "0", minHeight: "0", height: "100%", overflowY: "auto", overflowX: "hidden", scrollbarGutter: "stable", padding: "8px", paddingRight: "12px", boxSizing: "border-box" } });
        const messages = getDisplayMessages();
        list.appendChild(el("div", { html: "<b>Convo Chat History</b><br><span style='color:#64748b'>SEND saves here and into the CONVO folder store.</span>", style: { marginBottom: "8px", lineHeight: "1.35" } }));
        if (!messages.length) list.appendChild(el("div", { text: "No local messages yet.", style: { color: "#64748b", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px" } }));
        else messages.forEach(message => list.appendChild(renderMessage(message)));
        messageRow.appendChild(list);

        const input = el("textarea", { placeholder: "Message as Jay...", style: { flex: "1 1 auto", width: "100%", height: "44px", minHeight: "44px", maxHeight: "88px", resize: "none", border: "1px solid #cbd5e1", borderRadius: "8px", padding: "8px", fontSize: "12px", lineHeight: "1.35", outline: "none", boxSizing: "border-box" } });
        protectConvoInput(input);
        function send() {
            const text = input.value.trim();
            if (!text) return;
            addMessage("user", text, "saved");
            input.value = "";
            ui().render();
        }
        input.addEventListener("keydown", event => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } });
        const inputRow = el("div", { style: { flex: "0 0 auto", position: "sticky", bottom: "0", zIndex: "5", borderTop: "1px solid #e2e8f0", padding: "8px", display: "flex", flexDirection: "row", gap: "6px", alignItems: "flex-end", background: "#f8fafc", boxSizing: "border-box" } }, [input, btn("SEND", send, { bg: "#2563eb", border: "#2563eb", color: "#ffffff", bold: true, padding: "9px 10px" })]);
        parentColumn.appendChild(messageRow);
        parentColumn.appendChild(inputRow);
        setTimeout(() => { list.scrollTop = list.scrollHeight; }, 0);
        return parentColumn;
    }

    seedSampleMessages();
    window.Chad.uiConvo = {
        render: renderConvo,
        addMessage,
        getDisplayMessages,
        loadLocalBuddyMessages,
        seedSampleMessages,
        getConvoFolder: () => loadJSON(CONVO_FOLDER_KEY, { folder: "CONVO", files: {}, updatedAt: "" }),
        getJayConvoFile: () => loadJSON(JAY_FILE_KEY, { name: "Jay_convo.md", path: "CONVO/Jay_convo.md", content: "", updatedAt: "" })
    };
})();
