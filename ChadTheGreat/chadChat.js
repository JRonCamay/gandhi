window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "chadChat";
    const CHAT_KEY = "gandhi_chad_chat_messages_v1";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "chadChat.js",
        creator: "Brenda",
        purpose: "Adds a Chad chat tab with bottom message input and send button",
        timestamp: 260704,
        parent: "ChadTheGreat",
        on: true
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function loadMessages() {
        try {
            const raw = localStorage.getItem(CHAT_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }

    function saveMessages(messages) {
        localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
    }

    function stamp() {
        return new Date().toLocaleString();
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
            .replace(/"/g, "&quot;");
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

    function findPromptBox() {
        return document.querySelector("#prompt-textarea") ||
            document.querySelector("textarea[data-id='root']") ||
            document.querySelector("textarea") ||
            document.querySelector("[contenteditable='true']");
    }

    function setNativeValue(element, value) {
        const proto = element instanceof HTMLTextAreaElement
            ? HTMLTextAreaElement.prototype
            : element instanceof HTMLInputElement
                ? HTMLInputElement.prototype
                : null;

        if (proto) {
            const setter = Object.getOwnPropertyDescriptor(proto, "value").set;
            setter.call(element, value);
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

    function addMessage(role, text, status) {
        const messages = loadMessages();
        messages.push({
            id: "msg-" + Date.now(),
            role,
            text,
            status: status || "sent",
            createdAt: stamp()
        });
        saveMessages(messages.slice(-80));
    }

    function renderMessage(message) {
        const isUser = message.role === "user";
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
                html: `<b>${isUser ? "You" : "Chad"}</b> <span style="color:#64748b">${escapeHTML(message.createdAt || "")}</span>`,
                style: { fontSize: "11px", marginBottom: "4px" }
            }),
            createEl("div", {
                text: message.text || "",
                style: { whiteSpace: "pre-wrap", lineHeight: "1.35", color: "#0f172a" }
            }),
            message.status === "copied" ? createEl("div", {
                text: "Prompt box not found. Message copied instead.",
                style: { color: "#ca8a04", fontSize: "11px", marginTop: "5px" }
            }) : null
        ]);
    }

    function renderChatBody() {
        const wrap = createEl("div", {
            style: {
                height: "calc(100vh - 158px)",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column"
            }
        });

        const messages = loadMessages();
        const list = createEl("div", {
            style: {
                flex: "1",
                overflowY: "auto",
                padding: "8px"
            }
        });

        list.appendChild(createEl("div", {
            html: "<b>Chad Chat</b><br><span style='color:#64748b'>Type here. SEND forwards the message to the main ChatGPT input.</span>",
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

        const input = createEl("textarea", {
            placeholder: "Message Brenda...",
            style: {
                flex: "1",
                minHeight: "44px",
                maxHeight: "110px",
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
                borderTop: "1px solid #e2e8f0",
                padding: "8px",
                display: "flex",
                gap: "6px",
                alignItems: "flex-end",
                background: "#f8fafc"
            }
        }, [
            input,
            button("SEND", send, { bg: "#2563eb", border: "#2563eb", color: "#ffffff", bold: true, padding: "9px 10px" })
        ]);

        wrap.appendChild(list);
        wrap.appendChild(inputRow);

        setTimeout(() => {
            list.scrollTop = list.scrollHeight;
            input.focus();
        }, 0);

        return wrap;
    }

    function insertTabButton() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel || !panel.children[0]) return;

        const header = panel.children[0];
        const tabRow = header.children[1];
        if (!tabRow || tabRow.querySelector("button[data-chad-chat-tab='1']")) return;

        const state = window.Chad.storage && window.Chad.storage.state;
        const btn = button("Chad", () => {
            if (!state) return;
            state.activeTab = "chadChat";
            if (window.Chad.ui && window.Chad.ui.render) window.Chad.ui.render();
        }, {
            bg: state && state.activeTab === "chadChat" ? "#2563eb" : "#ffffff",
            color: state && state.activeTab === "chadChat" ? "#ffffff" : "#0f172a",
            border: state && state.activeTab === "chadChat" ? "#2563eb" : "#cbd5e1",
            bold: state && state.activeTab === "chadChat"
        });
        btn.dataset.chadChatTab = "1";

        const firstButton = tabRow.querySelector("button");
        if (firstButton && firstButton.nextSibling) tabRow.insertBefore(btn, firstButton.nextSibling);
        else tabRow.appendChild(btn);
    }

    function replaceBodyIfNeeded() {
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!state || state.activeTab !== "chadChat") return;

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
        if (!ui || !ui.render || ui.__chadChatPatched) return false;

        const originalRender = ui.render;
        ui.render = function () {
            const result = originalRender.apply(ui, arguments);
            patchAfterRender();
            return result;
        };

        ui.__chadChatPatched = true;
        return true;
    }

    function start() {
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
        sendToMainChat
    };

    start();
})();