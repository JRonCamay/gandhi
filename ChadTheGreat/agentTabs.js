window.Chad = window.Chad || {};

(function () {
    "use strict";

    function scrollToEnd() {
        setTimeout(() => {
            try {
                const targets = [
                    document.querySelector("main"),
                    document.querySelector("[role='main']"),
                    document.scrollingElement,
                    document.documentElement,
                    document.body
                ].filter(Boolean);
                targets.forEach(target => target.scrollTop = target.scrollHeight);
                window.scrollTo(0, document.body.scrollHeight);
            }
            catch {}
        }, 250);
    }

    function openAgent(agent, renderChatiesStable) {
        const identity = window.Chad.agentIdentity;
        if (!agent || !identity) return;

        identity.setActiveId(agent.id);
        identity.setExpanded(agent.id, true);

        if (identity.sameUrl(location.href, agent.chatUrl || "")) {
            scrollToEnd();
            if (window.Chad.ui && window.Chad.ui.applyTabIdentity) window.Chad.ui.applyTabIdentity();
            if (typeof renderChatiesStable === "function") renderChatiesStable(true);
            return;
        }

        if (window.Chad.bridge && window.Chad.bridge.openAgentTab) {
            window.Chad.bridge.openAgentTab(agent).catch(() => {
                window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
            });
        }
        else {
            window.open(agent.chatUrl || "https://chatgpt.com/", "chad_agent_" + agent.id);
        }

        if (typeof renderChatiesStable === "function") renderChatiesStable(true);
    }

    window.Chad.agentTabs = {
        openAgent,
        scrollToEnd
    };
})();
