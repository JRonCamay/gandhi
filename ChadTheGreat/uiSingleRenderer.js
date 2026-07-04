window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "uiSingleRenderer";
    const CHAT_KEY = "gandhi_chad_chat_messages_v1";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    if (!runtimeSwitchboard) return;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "uiSingleRenderer.js",
        creator: "Brenda",
        purpose: "Owns extra tab integration so only one coordinator touches Chad tab panels",
        timestamp: 260704,
        parent: "ChadTheGreat",
        on: true
    });

    function isOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function getState() {
        return window.Chad.storage && window.Chad.storage.state;
    }

    function getPanel() {
        return document.querySelector("#gandhi-chad-panel");
    }

    function createEl(tag, props, children) {
        return window.Chad.ui.createEl(tag, props || {}, children || []);
    }

    function button(label, fn, extra) {
        return window.Chad.ui.button(label, fn, extra || {});
    }

    function loadMessages() {
        try {
            const parsed = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
            return Array.isArray(parsed) ? parsed : [];
        }
        catch {
            return [];
        }
    }

    function saveMessages(messages) {
        localStorage.setItem(CHAT_KEY, JSON.stringify(messages.slice(-120)));
    }

    function seedMoreConvoSamples() {
        const messages = loadMessages();
        if (messages.length >= 14) return;

        const now = Date.now();
        const samples = [
            ["agent", "👩🏼", "Brenda", "Renderer check: Convo should stay inside the main Chad panel."],
            ["buddy", "🧔", "Shaggy", "Scrollbar check 1: this is an extra sample message."],
            ["buddy", "🧔", "Shaggy", "Scrollbar check 2: message list should scroll, input row should stay fixed."],
            ["agent", "👩🏼", "Brenda", "Scrollbar check 3: only the message area should move."],
            ["user", "👤", "Jay", "Testing more messages so the scroll area is forced to overflow."],
            ["agent", "👩🏼", "Brenda", "Focus check: clicking the Convo textbox should not jump to ChatGPT input."],
            ["buddy", "🤖", "Manuel", "Verification check: tab header and tab body should come from one coordinator."],
            ["agent", "👩🏼", "Brenda", "Final sample: Convo tab remains visible after rerender."],
            ["user", "👤", "Jay", "Last sample message for scrollbar testing."]
        ];

        samples.forEach((item, index) => {
            messages.push({
                id: "sample-extra-" + index,
                role: item[0],
                icon: item[1],
                name: item[2],
                text: item[3],
                status: "sample",
                createdAt: new Date(now - (samples.length - index) * 30000).toLocaleString(),
                timestamp: now - (samples.length - index) * 30000
            });
        });

        saveMessages(messages);
    }

    function installFocusGuard() {
        const panel = getPanel();
        if (!panel || panel.__chadSingleRendererFocusGuard) return;

        function isPanelInput(target) {
            return !!(target && target.closest && target.closest("input, textarea, select, [contenteditable='true'], [role='textbox'], .ProseMirror"));
        }

        function protect(event) {
            const target = event.target;
            if (!isOn() || !target || !panel.contains(target) || !isPanelInput(target)) return;
            event.stopPropagation();
        }

        ["mousedown", "mouseup", "click", "focusin", "keydown", "keyup", "input"].forEach(type => {
            panel.addEventListener(type, protect, false);
        });

        panel.__chadSingleRendererFocusGuard = true;
    }

    function findTabRow() {
        const panel = getPanel();
        if (!panel || !panel.children[0]) return null;
        return panel.children[0].children[1] || null;
    }

    function ensureConvoTab() {
        const state = getState();
        const tabRow = findTabRow();
        if (!state || !tabRow) return;

        Array.from(tabRow.querySelectorAll("button[data-chad-chat-tab='1'], button[data-chad-convo-tab='1'], button[data-chad-single-convo='1']")).forEach(btn => btn.remove());

        const btn = button("Convo", () => {
            state.activeTab = "convo";
            window.Chad.ui.render();
        }, {
            bg: state.activeTab === "convo" ? "#2563eb" : "#ffffff",
            color: state.activeTab === "convo" ? "#ffffff" : "#0f172a",
            border: state.activeTab === "convo" ? "#2563eb" : "#cbd5e1",
            bold: state.activeTab === "convo"
        });
        btn.dataset.chadSingleConvo = "1";

        const first = tabRow.querySelector("button");
        if (first && first.nextSibling) tabRow.insertBefore(btn, first.nextSibling);
        else tabRow.appendChild(btn);
    }

    function renderConvoBody() {
        if (window.Chad.chadChat && window.Chad.chadChat.render) return window.Chad.chadChat.render();
        return createEl("div", { text: "Convo renderer loading...", style: { padding: "8px", color: "#64748b" } });
    }

    function replaceBodyForConvo() {
        const state = getState();
        const panel = getPanel();
        if (!state || state.activeTab !== "convo" || !panel) return;

        const oldBody = panel.children[1];
        const newBody = renderConvoBody();
        if (oldBody) oldBody.replaceWith(newBody);
        else panel.appendChild(newBody);
    }

    function applyAfterRender() {
        if (!isOn()) return;
        installFocusGuard();
        ensureConvoTab();
        replaceBodyForConvo();
    }

    function patchUiRender() {
        const ui = window.Chad.ui;
        if (!ui || !ui.render || ui.__chadSingleRenderer260704) return false;

        const original = ui.render;
        ui.render = function () {
            const result = original.apply(ui, arguments);
            applyAfterRender();
            return result;
        };

        ui.__chadSingleRenderer260704 = true;
        return true;
    }

    function disableCompetingPanelRenderers() {
        runtimeSwitchboard.disable("chadChat");
        runtimeSwitchboard.disable("chadConvoLayoutFix");
    }

    function start() {
        seedMoreConvoSamples();
        disableCompetingPanelRenderers();
        patchUiRender();
        applyAfterRender();

        setInterval(() => {
            if (!isOn()) return;
            disableCompetingPanelRenderers();
            patchUiRender();
            applyAfterRender();
        }, 700);
    }

    window.Chad.uiSingleRenderer = {
        apply: applyAfterRender,
        patchUiRender,
        seedMoreConvoSamples
    };

    start();
})();
