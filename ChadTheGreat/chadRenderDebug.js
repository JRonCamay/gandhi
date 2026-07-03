window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "renderDebug";
    const LABEL_ID = "gandhi-chad-render-debug";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "chadRenderDebug.js",
        creator: "Manuel",
        purpose: "Temporary Chaties renderer debug label",
        timestamp: 260703,
        parent: "ChadTheGreat",
        on: false
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function getPanel() {
        return document.querySelector("#gandhi-chad-panel");
    }

    function getBody(panel) {
        if (!panel || !panel.children || panel.children.length < 2) return null;
        return panel.children[1];
    }

    function detectRenderer(body) {
        const text = body ? body.textContent || "" : "";

        if (text.includes("Agents are closed by default")) return "uiChaties.js current";
        if (text.includes("File data loads only after SCAN FILES")) return "uiChaties.js previous";
        if (text.includes("Global agents. Arrow expands")) return "agentFixes.js legacy";
        if (text.includes("Global agents. Opens tabs")) return "ui.js legacy";
        if (text.includes("Chaties modules are still loading")) return "uiChaties.js loading";

        return "unknown renderer";
    }

    function ensureLabel(body) {
        let label = body.querySelector("#" + LABEL_ID);
        if (!label) {
            label = document.createElement("div");
            label.id = LABEL_ID;
            Object.assign(label.style, {
                padding: "6px 8px",
                marginBottom: "7px",
                border: "1px solid #f97316",
                borderRadius: "7px",
                background: "#fff7ed",
                color: "#9a3412",
                fontSize: "11px",
                fontWeight: "800",
                fontFamily: "Consolas, monospace"
            });
            body.insertBefore(label, body.firstChild);
        }
        return label;
    }

    function mark() {
        if (!isModuleOn()) return;

        const panel = getPanel();
        const state = window.Chad.storage && window.Chad.storage.state;
        if (!panel || !state || state.activeTab !== "chaties") return;

        const body = getBody(panel);
        if (!body) return;

        const renderer = detectRenderer(body);
        const label = ensureLabel(body);
        label.textContent = "DEBUG RENDERER: " + renderer;
    }

    function start() {
        mark();
        setInterval(() => {
            if (!isModuleOn()) return;
            mark();
        }, 300);
    }

    window.Chad.renderDebug = {
        mark,
        detectRenderer
    };

    start();
})();
