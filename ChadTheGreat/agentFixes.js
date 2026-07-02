window.Chad = window.Chad || {};

(function () {
    "use strict";

    function renderChatiesStable() {
        if (window.Chad.uiChaties && window.Chad.uiChaties.renderIntoPanel) {
            window.Chad.uiChaties.renderIntoPanel();
        }
    }

    function tick() {
        if (window.Chad.agentIdentity) {
            window.Chad.agentIdentity.syncActiveAgentToCurrentUrl(renderChatiesStable);
        }
        if (window.Chad.chadDock) {
            window.Chad.chadDock.patchCloseButton();
        }
    }

    function start() {
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
            if (window.Chad.agentTabs) window.Chad.agentTabs.scrollToEnd();
        },
        syncActiveAgentToCurrentUrl() {
            if (window.Chad.agentIdentity) {
                window.Chad.agentIdentity.syncActiveAgentToCurrentUrl(renderChatiesStable);
            }
        },
        showDock() {
            if (window.Chad.chadDock) window.Chad.chadDock.showDock();
        }
    };

    start();
})();
