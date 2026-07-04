window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "chatiesConvoWindowSafe";
    const CACHE_KEY = "gandhi_chad_chaties_convo_files_v1";
    const REPO_BASE = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/CHATIES_CONVO_LOGS/CURRENT/";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    const convoFiles260704_p9x4kd = [
        "260703-011700-shaggy.md",
        "260703-044900-brenda.md",
        "260703-045000-test01.md",
        "260703-045100-test02.md",
        "260703-045200-test03.md",
        "260704-002000-brenda-ui.md",
        "260704-002100-shaggy-ui.md",
        "260704-002200-manuel-ui.md"
    ];

    let observer260704_q7m2xa = null;
    let loading260704_h5p8zc = false;
    let decorateTimer260704_m8z1kc = null;
    let allowInputFocusUntil260704_j4n8vb = 0;

    if (!runtimeSwitchboard) return;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "chatiesConvoWindowSafe.js",
        creator: "Brenda",
        purpose: "Displays CHATIES_CONVO_LOGS in Chad and patches safe panel controls",
        timestamp: 260704,
        parent: "ChadTheGreat",
        on: true
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;");
    }

    function createEl(tag, props, children) {
        const node = document.createElement(tag);
        for (const key in props || {}) {
            if (key === "style") Object.assign(node.style, props[key]);
            else if (key === "text") node.textContent = props[key];
            else if (key === "html") node.innerHTML = props[key];
            else node.setAttribute(key, props[key]);
        }
        (children || []).forEach(child => child && node.appendChild(child));
        return node;
    }

    function isChatiesTab() {
        const state = window.Chad.storage && window.Chad.storage.state;
        return !!state && state.activeTab === "chaties";
    }

    function isChadInput(element) {
        return !!element &&
            element.tagName === "TEXTAREA" &&
            element.placeholder === "Message Brenda..." &&
            element.closest("#gandhi-chad-panel");
    }

    function patchInputCapture() {
        if (document.__chatiesConvoInputPatched260704) return;
        document.__chatiesConvoInputPatched260704 = true;

        document.addEventListener("pointerdown", event => {
            if (!isModuleOn()) return;
            if (isChadInput(event.target)) {
                allowInputFocusUntil260704_j4n8vb = Date.now() + 3000;
            }
        }, true);

        document.addEventListener("focusin", event => {
            if (!isModuleOn()) return;
            if (!isChadInput(event.target)) return;
            if (Date.now() <= allowInputFocusUntil260704_j4n8vb) return;
            setTimeout(() => {
                if (document.activeElement === event.target) event.target.blur();
            }, 0);
        }, true);
    }

    function readCachedMessages() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CACHE_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }

    function saveCachedMessages(messages) {
        localStorage.setItem(CACHE_KEY, JSON.stringify(messages));
    }

    function messageHash(messages) {
        return messages.map(message => message.file + ":" + message.content.length).join("|") + ":" + loading260704_h5p8zc;
    }

    async function refreshRepoMessages() {
        if (!isModuleOn() || loading260704_h5p8zc) return;
        loading260704_h5p8zc = true;
        scheduleDecorate();

        const messages = [];
        for (const file of convoFiles260704_p9x4kd) {
            if (!/^\d{6}-\d{6}-[a-z0-9-]+\.md$/.test(file)) continue;
            try {
                const response = await fetch(REPO_BASE + encodeURIComponent(file) + "?t=" + Date.now());
                if (!response.ok) continue;
                const content = (await response.text()).trim();
                if (content) messages.push({ file, content });
            }
            catch {}
        }

        messages.sort((a, b) => a.file.localeCompare(b.file));
        saveCachedMessages(messages);
        loading260704_h5p8zc = false;
        scheduleDecorate();
    }

    function renderMessagesSection(messages, hash) {
        const box = createEl("div", {
            id: "gandhi-chaties-convo-section",
            style: {
                border: "1px solid #cbd5e1",
                borderRadius: "9px",
                padding: "8px",
                margin: "0 0 8px 0",
                background: "#f8fafc"
            }
        });
        box.dataset.hash260704 = hash;

        const header = createEl("div", {
            style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", marginBottom: "6px" }
        });

        header.appendChild(createEl("div", {
            html: "<b>CHATIES_CONVO_LOGS</b><br><span style='color:#64748b'>Actual repo messages loaded from CURRENT.</span>",
            style: { lineHeight: "1.35" }
        }));

        const refresh = createEl("button", {
            text: loading260704_h5p8zc ? "LOADING" : "REFRESH",
            style: { border: "1px solid #cbd5e1", borderRadius: "6px", background: "#ffffff", padding: "4px 7px", fontSize: "11px", cursor: "pointer" }
        });
        refresh.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            refreshRepoMessages();
        });
        header.appendChild(refresh);
        box.appendChild(header);

        if (!messages.length) {
            box.appendChild(createEl("div", {
                text: loading260704_h5p8zc ? "Loading messages..." : "No repo messages loaded yet. Click REFRESH.",
                style: { color: "#64748b", fontSize: "11px" }
            }));
            return box;
        }

        messages.forEach(message => {
            box.appendChild(createEl("div", {
                html: `<div style='color:#475569;font-size:10px;margin-bottom:3px'>${escapeHTML(message.file)}</div>${escapeHTML(message.content)}`,
                style: { border: "1px solid #e2e8f0", borderRadius: "7px", padding: "6px", marginTop: "5px", background: "#ffffff", whiteSpace: "pre-wrap", fontSize: "11px", lineHeight: "1.35" }
            }));
        });

        return box;
    }

    function decorateFolders(body) {
        Array.from(body.querySelectorAll("button")).forEach(button => {
            const text = button.textContent.trim();
            if (text !== "▸" && text !== "▾") return;

            const expanded = text === "▾";
            button.textContent = expanded ? "📂" : "📁";
            button.title = expanded ? "Collapse folder" : "Open folder";
            button.dataset.chatiesFolder260704 = expanded ? "open" : "closed";

            if (!expanded || button.nextSibling && button.nextSibling.dataset && button.nextSibling.dataset.chatiesClose260704) return;

            const close = createEl("button", {
                text: "×",
                title: "Close folder",
                style: { border: "1px solid #fecaca", borderRadius: "6px", background: "#fee2e2", color: "#991b1b", padding: "4px 6px", fontSize: "11px", cursor: "pointer", lineHeight: "1.1" }
            });
            close.dataset.chatiesClose260704 = "1";
            close.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                button.click();
            });
            button.parentNode.insertBefore(close, button.nextSibling);
        });
    }

    function decorateChatiesPanel() {
        if (!isModuleOn() || !isChatiesTab()) return;

        const panel = document.querySelector("#gandhi-chad-panel");
        const body = panel && panel.children && panel.children[1];
        if (!body) return;

        decorateFolders(body);

        const messages = readCachedMessages();
        const hash = messageHash(messages);
        const old = body.querySelector("#gandhi-chaties-convo-section");
        if (old && old.dataset.hash260704 === hash) return;
        if (old) old.remove();

        const section = renderMessagesSection(messages, hash);
        if (body.firstElementChild && body.firstElementChild.nextSibling) {
            body.insertBefore(section, body.firstElementChild.nextSibling);
        }
        else {
            body.insertBefore(section, body.firstChild);
        }
    }

    function scheduleDecorate() {
        if (decorateTimer260704_m8z1kc) return;
        decorateTimer260704_m8z1kc = setTimeout(() => {
            decorateTimer260704_m8z1kc = null;
            decorateChatiesPanel();
        }, 80);
    }

    function startObserver() {
        if (observer260704_q7m2xa) return;
        observer260704_q7m2xa = new MutationObserver(() => {
            if (!isModuleOn()) return;
            scheduleDecorate();
        });
        observer260704_q7m2xa.observe(document.documentElement, { childList: true, subtree: true });
    }

    function start() {
        patchInputCapture();
        startObserver();
        refreshRepoMessages();
        setTimeout(decorateChatiesPanel, 500);
    }

    window.Chad.chatiesConvoWindowSafe = {
        refreshRepoMessages,
        decorateChatiesPanel
    };

    start();
})();
