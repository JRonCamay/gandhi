window.Chad = window.Chad || {};

(function () {
    "use strict";

    const CHAT_KEY = "gandhi_chad_chat_messages_v1";
    const JAY_FILE_KEY = "gandhi_chad_convo_file_jay_v1";
    const CONVO_FOLDER_KEY = "gandhi_chad_convo_folder_v1";
    const PRUNE_LOG_KEY = "gandhi_chad_last_prune_v1";
    const RETENTION_DAYS = 10;
    const RETENTION_MS = RETENTION_DAYS * 24 * 60 * 60 * 1000;

    let cachedMessages = null;

    function ui() { return window.Chad.ui; }
    function el(tag, props, children) { return ui().createEl(tag, props || {}, children || []); }
    function btn(label, fn, extra) { return ui().button(label, fn, extra || {}); }
    function esc(text) { return ui().escapeHTML(text); }
    function stamp() { return new Date().toLocaleString(); }
    function todayKey() { return new Date().toISOString().slice(0, 10); }

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

    function messageTime(message, index) {
        const timestamp = Number(message && message.timestamp);
        if (Number.isFinite(timestamp) && timestamp > 0) return timestamp;
        const parsed = Date.parse((message && message.createdAt) || "");
        if (Number.isFinite(parsed) && parsed > 0) return parsed;
        return Date.now() + index;
    }

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
                text: index === 0
                    ? "Convo tab online. Messages display oldest to newest."
                    : "Sample " + (index + 1) + ": Convo message display and fixed composer test.",
                status: "sample",
                createdAt: new Date(now - ((30 - index) * 60000)).toLocaleString(),
                timestamp: now - ((30 - index) * 60000)
            };
        });
    }

    function normalizeMessage(message, index) {
        if (!message || typeof message !== "object") return null;
        const text = String(message.text || message.message || message.content || "").trim();
        if (!text) return null;
        const role = message.role || "agent";
        const isUser = role === "user" || message.name === "Jay";
        return {
            id: message.id || "msg-" + index,
            role,
            icon: message.icon || (isUser ? "👤" : "🤖"),
            name: message.name || (isUser ? "Jay" : "Chad"),
            text,
            status: message.status || "",
            createdAt: message.createdAt || stamp(),
            timestamp: messageTime(message, index)
        };
    }

    function messageToMarkdown(message) {
        return `## ${message.createdAt || ""}\n${message.icon || ""} ${message.name || message.role || "Unknown"}\n\n${message.text || ""}`;
    }

    function saveJayConvoFile(messages) {
        const jayMessages = messages.filter(message => message.role === "user" || message.name === "Jay");
        saveJSON(JAY_FILE_KEY, {
            name: "Jay_convo.md",
            path: "CONVO/Jay_convo.md",
            updatedAt: stamp(),
            content: jayMessages.map(messageToMarkdown).join("\n\n")
        });
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

    function saveMessages(messages) {
        cachedMessages = messages.slice(-160);
        saveJSON(CHAT_KEY, cachedMessages);
        saveConvoFolder(cachedMessages);
        saveJayConvoFile(cachedMessages);
    }

    function pruneDaily(messages) {
        const today = todayKey();
        const lastPrune = loadJSON(PRUNE_LOG_KEY, null);
        if (lastPrune && lastPrune.date === today) return messages;

        const cutoff = Date.now() - RETENTION_MS;
        const kept = messages.filter((message, index) => messageTime(message, index) >= cutoff);
        const removed = messages.length - kept.length;

        saveMessages(kept);
        saveJSON(PRUNE_LOG_KEY, {
            date: today,
            retentionDays: RETENTION_DAYS,
            removed,
            version: 1,
            updatedAt: stamp()
        });
        return kept;
    }

    function loadMessages() {
        if (cachedMessages) return cachedMessages;

        const loaded = loadJSON(CHAT_KEY, null);
        const hadStoredMessages = Array.isArray(loaded) && loaded.length > 0;
        const messages = Array.isArray(loaded)
            ? loaded.map(normalizeMessage).filter(Boolean)
            : [];

        cachedMessages = hadStoredMessages ? pruneDaily(messages) : sampleMessages(Date.now());
        saveMessages(cachedMessages);
        return cachedMessages;
    }

    function addMessage(role, text, status) {
        const now = Date.now();
        const messages = loadMessages().slice();
        const message = {
            id: "msg-" + now,
            role,
            icon: role === "user" ? "👤" : "🤖",
            name: role === "user" ? "Jay" : "Chad",
            text,
            status: status || "saved",
            createdAt: stamp(),
            timestamp: now
        };
        messages.push(message);
        saveMessages(messages);
        return message;
    }

    function getDisplayMessages() {
        return loadMessages()
            .slice()
            .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
    }

    function renderMessage(message) {
        const isUser = message.role === "user" || message.name === "Jay";
        const timestamp = message.createdAt || (message.timestamp ? new Date(message.timestamp).toLocaleString() : "");
        return el("div", {
            style: {
                border: "1px solid " + (isUser ? "#bfdbfe" : "#e2e8f0"),
                borderRadius: "9px",
                padding: "7px",
                marginBottom: "7px",
                background: isUser ? "#eff6ff" : "#f8fafc"
            }
        }, [
            el("div", {
                html: `${esc(message.icon || "🤖")} <b>${esc(message.name || "Agent")}:</b> ${esc(message.text || "")}`,
                style: { whiteSpace: "pre-wrap", lineHeight: "1.35", color: "#0f172a" }
            }),
            el("div", {
                text: timestamp,
                style: { color: "#64748b", fontSize: "10px", marginTop: "4px", paddingLeft: "22px" }
            })
        ]);
    }

    function stopPanelBubble(node) {
        ["pointerdown", "mousedown", "mouseup", "click", "focusin", "keydown", "keyup", "input", "beforeinput"].forEach(type => {
            node.addEventListener(type, event => event.stopPropagation());
        });
    }

    function renderConvo() {
        const root = el("div", {
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                height: "100%",
                overflow: "hidden",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column"
            }
        });

        const history = el("div", {
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                overflowY: "auto",
                overflowX: "hidden",
                padding: "8px",
                paddingRight: "12px",
                boxSizing: "border-box"
            }
        });

        history.appendChild(el("div", {
            html: "<b>Convo Chat History</b><br><span style='color:#64748b'>SEND saves here and into the CONVO folder store.</span>",
            style: { marginBottom: "8px", lineHeight: "1.35" }
        }));

        const messages = getDisplayMessages();
        if (!messages.length) {
            history.appendChild(el("div", {
                text: "No local messages yet.",
                style: { color: "#64748b", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px" }
            }));
        }
        else {
            messages.forEach(message => history.appendChild(renderMessage(message)));
        }

        const input = el("textarea", {
            placeholder: "Message as Jay...",
            style: {
                flex: "1 1 auto",
                width: "100%",
                height: "44px",
                minHeight: "44px",
                maxHeight: "44px",
                resize: "none",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "12px",
                lineHeight: "1.35",
                outline: "none",
                boxSizing: "border-box"
            }
        });
        stopPanelBubble(input);

        function send() {
            const text = input.value.trim();
            if (!text) return;
            addMessage("user", text, "saved");
            ui().render();
        }

        input.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
            }
        });

        const composer = el("div", {
            style: {
                flex: "0 0 64px",
                height: "64px",
                minHeight: "64px",
                borderTop: "1px solid #e2e8f0",
                padding: "8px",
                display: "flex",
                gap: "6px",
                alignItems: "flex-end",
                background: "#f8fafc",
                boxSizing: "border-box"
            }
        }, [
            input,
            btn("SEND", send, { bg: "#2563eb", border: "#2563eb", color: "#ffffff", bold: true, padding: "9px 10px" })
        ]);

        root.appendChild(history);
        root.appendChild(composer);
        requestAnimationFrame(() => { history.scrollTop = history.scrollHeight; });
        return root;
    }

    loadMessages();

    window.Chad.uiConvo = {
        render: renderConvo,
        addMessage,
        getDisplayMessages,
        loadLocalBuddyMessages: () => [],
        seedSampleMessages: () => saveMessages(sampleMessages(Date.now())),
        pruneDaily: () => pruneDaily(loadMessages()),
        getPruneLog: () => loadJSON(PRUNE_LOG_KEY, null),
        getConvoFolder: () => loadJSON(CONVO_FOLDER_KEY, { folder: "CONVO", files: {}, updatedAt: "" }),
        getJayConvoFile: () => loadJSON(JAY_FILE_KEY, { name: "Jay_convo.md", path: "CONVO/Jay_convo.md", content: "", updatedAt: "" })
    };
})();
