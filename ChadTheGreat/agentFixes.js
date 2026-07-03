window.Chad = window.Chad || {};

(function () {
    "use strict";

    const MODULE_KEY = "agentFixes";
    const runtimeSwitchboard = window.Chad.runtimeSwitchboard;

    runtimeSwitchboard.register({
        key: MODULE_KEY,
        file: "agentFixes.js",
        creator: "Manuel",
        purpose: "Agent sync, dock, and compatibility runtime fixes",
        timestamp: 260703,
        parent: "ChadTheGreat",
        on: true
    });

    function isModuleOn() {
        return runtimeSwitchboard.isOn(MODULE_KEY);
    }

    function renderChatiesStable() {
        if (!isModuleOn()) return;

        if (window.Chad.uiChaties && window.Chad.uiChaties.renderIntoPanel) {
            window.Chad.uiChaties.renderIntoPanel();
        }
    }

    function tick() {
        if (!isModuleOn()) return;

        if (window.Chad.agentIdentity) {
            window.Chad.agentIdentity.syncActiveAgentToCurrentUrl(renderChatiesStable);
        }
        if (window.Chad.chadDock) {
            window.Chad.chadDock.patchCloseButton();
        }
    }

    function start() {
        if (!isModuleOn()) return;

        if (window.Chad.pressFeedback) {
            window.Chad.pressFeedback.addPressFeedback();
        }
        if (window.Chad.chadDock) {
            window.Chad.chadDock.ensureDock(renderChatiesStable);
        }
        setInterval(tick, 600);
        setTimeout(tick, 300);
        setTimeout(tick, 1200);
    }

    window.Chad.agentFixes = {
        renderChatiesStable,
        scrollToEnd() {
            if (!isModuleOn()) return;
            if (window.Chad.agentTabs) window.Chad.agentTabs.scrollToEnd();
        },
        syncActiveAgentToCurrentUrl() {
            if (!isModuleOn()) return;
            if (window.Chad.agentIdentity) {
                window.Chad.agentIdentity.syncActiveAgentToCurrentUrl(renderChatiesStable);
            }
        },
        showDock() {
            if (!isModuleOn()) return;
            if (window.Chad.chadDock) window.Chad.chadDock.showDock();
        }
    };

    start();
})();
