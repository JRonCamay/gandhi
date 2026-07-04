window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "chadChat";
    const CHAT_KEY = "gandhi_chad_chat_messages_v1";
    const JAY_FILE_KEY = "gandhi_chad_convo_file_jay_v1";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    if (!runtimeSwitchboard) return;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "chadChat.js",
        creator: "Brenda",
        purpose: "Adds the Convo tab with messages, input, send, and Jay convo-file storage",
        timestamp: 260704,
        parent: "ChadTheGreat",
        on: true
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            const parsed = raw ? JSON.parse(raw) : fallback;
            return parsed || fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function loadMessages() {
        const messages = loadJSON(CHAT_KEY, []);
        return Array.isArray(messages) ? messages : [];
    }

    function saveMessages(messages) {
        saveJSON(CHAT_KEY, messages.slice(-120));
    }

    function stamp() {
        return new Date().toLocaleString();
    }

    function timeValue(value) {
        if (typeof value === "number" && Number.isFinite(value)) return value;
        if (!value) return 0;
        const parsed = Date.parse(value);
        return Number.isFinite(parsed) ? parsed : 0;
    }

    function seedSampleMessages() {
        if (loadMessages().length) return;

        const now = Date.now();
        saveMessages([
            {
                id: "sample-001",
                role: "agent",
                icon: "👱🏻‍♀️",
                name: "Brenda",
                text: "Convo tab online. Messages display oldest to newest.",
                status: "sample",
                createdAt: new Date(now - 180000).toLocaleString(),
                timestamp: now - 180000
            },
            {
                id: "sample-002",
                role: "buddy",
                icon: "🧔",
                name: "Shaggy",
                text: "Chaties keeps agents. Convo keeps messages.",
                status: "sample",
                createdAt: new Date(now - 120000).toLocaleString(),
                timestamp: now - 120000
            },
            {
                id: "sample-003",
                role: "user",
                icon: "👤",
                name: "Jay",
                text: "Testing Jay convo-file save.",
                status: "sample",
                createdAt: new Date(now - 60000).toLocaleString(),
                timestamp: now - 60000
            }
        ]);
    }

    function createEl(tag, props, children) {
        if (window.Chad.ui && window.Chad.ui.createEl) {
            return window.Chad.ui.createEl(tag, props || {}, children || []);
        }

        const node = document.createElement(tag);
        for (const key in props || {}) {
            if (key === "style") Object.assign(node.style, props[key]);
            else if (key === "text") node.textContent = props[key];
            else if (key === "html") node.innerHTML = props[key];
            else if (key.startsWith("on")) node.addEventListener(key.slice(2).toLowerCase(), props[key]);
            else node.setAttribute(key, props[key]);
        }
        (children || []).forEach(child => child && node.appendChild(child));
        return node;
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;");
    }

    function button(label, fn, extra) {
        const btn = createEl("button", {
            text: label,
            title: extra && extra.title ? extra.title : "",
            style: {
                background: extra && extra.bg ? extra.bg : "#f8fafc",
                color: extra && extra.color ? extra.color : "#0f172a",
                border: "1px solid " + (extra && extra.border ? extra.border : "#cbd5e1"),
                borderRadius: "6px",
                padding: extra && extra.padding ? extra.padding : "4px 7px",
                fontSize: extra && extra.fontSize ? extra.fontSize : "11px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: extra && extra.bold ? "700" : "500"
            }
        });

        btn.addEventListener("click", event => {
            if (!isModuleOn()) return;
            event.preventDefault();
            event.stopPropagation();
            fn(event);
        });

        return btn;
    }

    function isInsideChadPanel(element) {
        return !!(element && element.closest && element.closest("#gandhi-chad-panel"));
    }

    function findPromptBox() {
        const candidates = Array.from(document.querySelectorAll("#prompt-textarea, textarea[data-id='root'], [contenteditable='true'], textarea"));
        return candidates.find(element => !isInsideChadPanel(element)) || null;
    }

    function setNativeValue(element, value) {
        const proto = element instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : element instanceof HTMLInputElement
                ? HTMLInputElement.prototype
                : null;

        if (proto) {
            const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
            if (descriptor && descriptor.set) descriptor.set.call(element, value);
            else element.value = value;
        }
        else {
            element.textContent = value;
        }

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

        if (sendButton) {
            sendButton.click();
            return true;
        }

        return false;
    }

    function sendToMainChat(text) {
        const prompt = findPromptBox();
        if (!prompt) {
            if (window.Chad.actions && window.Chad.actions.copyText) window.Chad.actions.copyText(text);
            return false;
        }

        prompt.focus();
        setNativeValue(prompt, text);

        setTimeout(() => {
            if (!clickMainSendButton()) {
                prompt.dispatchEvent(new KeyboardEvent("keydown", {
                    bubbles: true,
                    cancelable: true,
                    key: "Enter",
                    code: "Enter"
                }));
            }
        }, 60);

        return true;
    }

    function saveJayConvoFile(messages) {
        const jayMessages = messages.filter(message => message.role === "user" || message.name === "Jay");
        const content = jayMessages.map(message => {
            return `## ${message.createdAt || ""}\n${message.text || ""}`;
        }).join("\n\n");

        saveJSON(JAY_FILE_KEY, {
            name: "Jay_convo.md",
            updatedAt: stamp(),
            content
        });
    }

    function addMessage(role, text, status) {
        const now = Date.now();
        const messages = loadMessages();
        messages.push({
            id: "msg-" + now,
            role,
            icon: role === "user" ? "👤" : "🤖",
            name: role === "user" ? "Jay" : "Chad",
            text,
            status: status || "sent",
            createdAt: stamp(),
            timestamp: now
        });
        saveMessages(messages);
        saveJayConvoFile(messages);
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

        return {
            id: raw.id || `${fallback.source}-${fallback.index}`,
            source: fallback.source || "local",
            role,
            icon,
            name,
            text: String(text),
            status: raw.status || "",
            createdAt: raw.createdAt || raw.time || raw.date || (ms ? new Date(ms).toLocaleString() : ""),
            timestamp: ms
        };
    }

    function collectMessageObjects(value, bucket, source, depth) {
        if (!value || depth > 4) return;

        if (Array.isArray(value)) {
            value.forEach(item => collectMessageObjects(item, bucket, source, depth + 1));
            return;
        }

        if (typeof value !== "object") return;

        const maybe = normalizeMessage(value, {
            source,
            index: bucket.length + 1,
            name: source.includes("buddy") ? "Buddy" : "Chad",
            icon: source.includes("buddy") ? "🤝" : "🤖"
        });

        if (maybe) bucket.push(maybe);

        ["messages", "chats", "history", "items", "threads", "records"].forEach(key => {
            if (value[key]) collectMessageObjects(value[key], bucket, source, depth + 1);
        });
    }

    function loadLocalBuddyMessages() {
        const messages = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i) || "";
            const lower = key.toLowerCase();
            const looksRelevant = lower.includes("buddy") || lower.includes("buddies") || lower.includes("local") || lower.includes("agent_chat");
            if (!looksRelevant || key === CHAT_KEY || key === JAY_FILE_KEY) continue;

            try {
                const parsed = JSON.parse(localStorage.getItem(key));
                collectMessageObjects(parsed, messages, key, 0);
            }
            catch {}
        }

        return messages;
    }

    function getDisplayMessages() {
        const own = loadMessages().map((message, index) => normalizeMessage(message, {
            source: CHAT_KEY,
            index,
            name: message.role === "user" ? "Jay" : "Chad",
            icon: message.role === "user" ? "👤" : "🤖",
            timestamp: message.timestamp || message.createdAt
        })).filter(Boolean);

        const buddies = loadLocalBuddyMessages();
        const map = new Map();

        own.concat(buddies).forEach((message, index) => {
            const key = `${message.source}|${message.id}|${message.text}|${message.timestamp || index}`;
            if (!map.has(key)) map.set(key, message);
        });

        return Array.from(map.values()).sort((a, b) => {
            const left = a.timestamp || 0;
            const right = b.timestamp || 0;
            if (left !== right) return left - right;
            return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
        });
    }

    function renderMessage(message) {
        const isUser = message.role === "user" || message.name === "Jay";
        const timestamp = message.createdAt || (message.timestamp ? new Date(message.timestamp).toLocaleString() : "");

        return createEl("div", {
            style: {
                border: "1px solid " + (isUser ? "#bfdbfe" : "#e2e8f0"),
                borderRadius: "9px",
                padding: "7px",
                marginBottom: "7px",
                background: isUser ? "#eff6ff" : "#f8fafc"
            }
        }, [
            createEl("div", {
                html: `${escapeHTML(message.icon || "🤖")} <b>${escapeHTML(message.name || "Agent")}:</b> ${escapeHTML(message.text || "")}`,
                style: { whiteSpace: "pre-wrap", lineHeight: "1.35", color: "#0f172a" }
            }),
            createEl("div", {
                text: timestamp,
                style: { color: "#64748b", fontSize: "10px", marginTop: "4px", paddingLeft: "22px" }
            }),
            message.status === "copied" ? createEl("div", {
                text: "Prompt box not found. Message copied instead.",
                style: { color: "#ca8a04", fontSize: "11px", marginTop: "5px", paddingLeft: "22px" }
            }) : null
        ]);
    }

    function renderChatBody() {
        const parentColumn = createEl("div", {
            style: {
                height: "calc(100vh - 158px)",
                minHeight: "0",
                overflow: "hidden",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column"
            }
        });

        const fixedColumn = createEl("div", {
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column"
            }
        });

        const messageRow = createEl("div", {
            style: {
                flex: "1 1 auto",
                minHeight: "0",
                overflow: "hidden",
                display: "flex"
            }
        });

        const messages = getDisplayMessages();
        const list = createEl("div", {
            style: {
                flex: "1 1 auto",
                minWidth: "0",
                minHeight: "0",
                overflowY: "auto",
                overflowX: "hidden",
                padding: "8px"
            }
        });

        list.appendChild(createEl("div", {
            html: "<b>Convo</b><br><span style='color:#64748b'>Conversation messages only. Chaties keeps agent profiles.</span>",
            style: { marginBottom: "8px", lineHeight: "1.35" }
        }));

        if (!messages.length) {
            list.appendChild(createEl("div", {
                text: "No local messages yet.",
                style: { color: "#64748b", padding: "10px", border: "1px dashed #cbd5e1", borderRadius: "8px" }
            }));
        }
        else {
            messages.forEach(message => list.appendChild(renderMessage(message)));
        }

        messageRow.appendChild(list);

        const input = createEl("textarea", {
            placeholder: "Message as Jay...",
            style: {
                flex: "1 1 auto",
                width: "100%",
                height: "44px",
                minHeight: "44px",
                maxHeight: "88px",
                resize: "vertical",
                border: "1px solid #cbd5e1",
                borderRadius: "8px",
                padding: "8px",
                fontSize: "12px",
                lineHeight: "1.35",
                outline: "none",
                boxSizing: "border-box"
            }
        });

        function send() {
            const text = input.value.trim();
            if (!text) return;

            const sent = sendToMainChat(text);
            addMessage("user", text, sent ? "sent" : "copied");
            input.value = "";
            patchAfterRender();
        }

        input.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                send();
            }
        });

        const inputRow = createEl("div", {
            style: {
                flex: "0 0 auto",
                borderTop: "1px solid #e2e8f0",
                padding: "8px",
                display: "flex",
                flexDirection: "row",
                gap: "6px",
                alignItems: "flex-end",
                background: "#f8fafc",
                boxSizing: "border-box"
            }
        }, [
            input,
            button("SEND", send, { bg: "#2563eb", border: "#2563eb", color: "#ffffff", bold: true, padding: "9px 10px" })
        ]);

        fixedColumn.appendChild(messageRow);
        fixedColumn.appendChild(inputRow);
        parentColumn.appendChild(fixedColumn);

        setTimeout(() => {
            list.scrollTop = list.scrollHeight;
        }, 0);

        return parentColumn;
    }

    function insertTabButton() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || !panel.children[0]) return;

        const header = panel.children[0];
        const tabRow = header.children[1];
        if (!tabRow) return;

        const old = tabRow.querySelector("button[data-chad-chat-tab='1']");
        if (old) old.remove();
        if (tabRow.querySelector("button[data-chad-convo-tab='1']")) return;

        const state = window.Chad.storage && window.Chad.storage.state;
        const btn = button("Convo", () => {
            if (!state) return;
            state.activeTab = "convo";
            if (window.Chad.ui && window.Chad.ui.render) window.Chad.ui.render();
        }, {
            bg: state && state.activeTab === "convo" ? "#2563eb" : "#ffffff",
            color: state && state.activeTab === "convo" ? "#ffffff" : "#0f172a",
            border: state && state.activeTab === "convo" ? "#2563eb" : "#cbd5e1",
            bold: state && state.activeTab === "convo"
        });
        btn.dataset.chadConvoTab = "1";

        const firstButton = tabRow.querySelector("button");
        if (firstButton && firstButton.nextSibling) tabRow.insertBefore(btn, firstButton.nextSibling);
        else tabRow.appendChild(btn);
    }

    function replaceBodyIfNeeded() {
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!state || state.activeTab !== "convo") return;

        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;

        const oldBody = panel.children[1];
        const newBody = renderChatBody();
        if (oldBody) oldBody.replaceWith(newBody);
        else panel.appendChild(newBody);
    }

    function patchAfterRender() {
        if (!isModuleOn()) return;
        insertTabButton();
        replaceBodyIfNeeded();
    }

    function patchUiRender() {
        const ui = window.Chad && window.Chad.ui;
        if (!ui || !ui.render || ui.__chadConvoPatched260704) return false;

        const originalRender = ui.render;
        ui.render = function () {
            const result = originalRender.apply(ui, arguments);
            patchAfterRender();
            return result;
        };

        ui.__chadConvoPatched260704 = true;
        return true;
    }

    function start() {
        seedSampleMessages();
        patchUiRender();
        patchAfterRender();
        setInterval(() => {
            if (!isModuleOn()) return;
            patchUiRender();
            patchAfterRender();
        }, 600);
    }

    window.Chad.chadChat = {
        render: renderChatBody,
        addMessage,
        sendToMainChat,
        getDisplayMessages,
        loadLocalBuddyMessages,
        seedSampleMessages,
        getJayConvoFile: function () {
            return loadJSON(JAY_FILE_KEY, { name: "Jay_convo.md", content: "", updatedAt: "" });
        }
    };

    start();
})();
