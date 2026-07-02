window.Chad = window.Chad || {};

(function () {
    "use strict";

    const EXPANDED_KEY = "gandhi_chad_expanded_agent_v3";
    let lastTab = "";

    function clearExpandedAgents() {
        localStorage.setItem(EXPANDED_KEY, "{}");

        if (
            window.Chad.agentIdentity &&
            typeof window.Chad.agentIdentity.setExpandedMap === "function"
        ) {
            window.Chad.agentIdentity.setExpandedMap({});
        }
    }

    function restorePanelVisibility(panel, oldVisibility) {
        if (!panel) return;
        panel.style.visibility = oldVisibility || "";
    }

    function patchAgentOpen() {
        const tabs = window.Chad.agentTabs;
        const identity = window.Chad.agentIdentity;

        if (!tabs || !identity || tabs.__defaultClosedPatched) return;

        const originalOpenAgent = tabs.openAgent;

        tabs.openAgent = function (agent, renderChatiesStable) {
            if (agent && agent.id) {
                identity.setExpanded(agent.id, false);
            }

            return originalOpenAgent.call(tabs, agent, function (force) {
                if (agent && agent.id) {
                    identity.setExpanded(agent.id, false);
                }
                if (typeof renderChatiesStable === "function") {
                    renderChatiesStable(force);
                }
            });
        };

        tabs.__defaultClosedPatched = true;
    }

    function patchIdentitySync() {
        const identity = window.Chad.agentIdentity;
        if (!identity || identity.__defaultClosedSyncPatched) return;

        const originalSync = identity.syncActiveAgentToCurrentUrl;

        identity.syncActiveAgentToCurrentUrl = function (renderChatiesStable) {
            return originalSync.call(identity, function (force) {
                clearExpandedAgents();
                if (typeof renderChatiesStable === "function") {
                    renderChatiesStable(force);
                }
            });
        };

        identity.__defaultClosedSyncPatched = true;
    }

    function patchUiRender() {
        if (!window.Chad.ui || window.Chad.ui.__defaultClosedRenderPatched) return;

        const originalRender = window.Chad.ui.render;

        window.Chad.ui.render = function () {
            const state = window.Chad.storage && window.Chad.storage.state;
            const nextTab = state && state.activeTab ? state.activeTab : "";
            const enteringChaties = nextTab === "chaties" && lastTab !== "chaties";
            const panel = document.querySelector("#gandhi-chad-panel");
            const oldVisibility = panel ? panel.style.visibility : "";

            if (enteringChaties) {
                clearExpandedAgents();
                if (panel) panel.style.visibility = "hidden";
            }

            originalRender.apply(window.Chad.ui, arguments);
            lastTab = nextTab;

            if (!enteringChaties && nextTab === "chaties" && window.Chad.agentFixes && window.Chad.agentFixes.renderChatiesStable) {
                window.Chad.agentFixes.renderChatiesStable(true);
            }

            if (enteringChaties) {
                requestAnimationFrame(() => restorePanelVisibility(panel, oldVisibility));
            }
        };

        window.Chad.ui.__defaultClosedRenderPatched = true;
    }

    function tick() {
        patchAgentOpen();
        patchIdentitySync();
        patchUiRender();
    }

    function start() {
        tick();
        setInterval(tick, 500);
    }

    window.Chad.chatiesDefaultClosed = {
        clearExpandedAgents,
        tick
    };

    start();
})();
