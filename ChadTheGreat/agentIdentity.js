window.Chad = window.Chad || {};

(function () {
    "use strict";

    const ACTIVE_KEY = "gandhi_chad_active_agent_id_v1";
    const EXPANDED_KEY = "gandhi_chad_expanded_agent_v3";
    const GLOBAL_AGENTS_KEY = "gandhi_chad_global_agents_v1";

    function normalizeUrl(url) {
        try {
            const parsed = new URL(url);
            parsed.hash = "";
            return parsed.href;
        }
        catch {
            return String(url || "").split("#")[0];
        }
    }

    function currentChatUrl() {
        return location.href.includes("/c/")
            ? location.href.split("#")[0]
            : "https://chatgpt.com/";
    }

    function sameUrl(a, b) {
        return normalizeUrl(a) === normalizeUrl(b);
    }

    function loadJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function getAgents() {
        if (window.Chad.ui && window.Chad.ui.getAgents) {
            return window.Chad.ui.getAgents();
        }
        return loadJSON(GLOBAL_AGENTS_KEY, []);
    }

    function saveAgents(agents) {
        if (window.Chad.ui && window.Chad.ui.saveAgents) {
            window.Chad.ui.saveAgents(agents);
            return;
        }
        saveJSON(GLOBAL_AGENTS_KEY, agents);
    }

    function getActiveId() {
        const here = currentChatUrl();
        const match = getAgents().find(agent => agent.chatUrl && sameUrl(agent.chatUrl, here));
        if (match) {
            localStorage.setItem(ACTIVE_KEY, match.id);
            return match.id;
        }
        return localStorage.getItem(ACTIVE_KEY) || (getAgents()[0] && getAgents()[0].id) || "";
    }

    function setActiveId(id) {
        localStorage.setItem(ACTIVE_KEY, id || "");
    }

    function getExpandedMap() {
        return loadJSON(EXPANDED_KEY, {});
    }

    function setExpandedMap(map) {
        saveJSON(EXPANDED_KEY, map || {});
    }

    function isExpanded(id) {
        return Boolean(getExpandedMap()[id]);
    }

    function toggleExpanded(id) {
        const map = getExpandedMap();
        map[id] = !map[id];
        setExpandedMap(map);
    }

    function setExpanded(id, value) {
        const map = getExpandedMap();
        map[id] = Boolean(value);
        setExpandedMap(map);
    }

    function syncActiveAgentToCurrentUrl(renderChatiesStable) {
        const here = currentChatUrl();
        const agents = getAgents();
        const match = agents.find(agent => agent.chatUrl && sameUrl(agent.chatUrl, here));

        if (match && getActiveId() !== match.id) {
            setActiveId(match.id);
            setExpanded(match.id, true);
            if (window.Chad.ui && window.Chad.ui.applyTabIdentity) {
                window.Chad.ui.applyTabIdentity();
            }
            if (
                window.Chad.storage &&
                window.Chad.storage.state &&
                window.Chad.storage.state.activeTab === "chaties" &&
                typeof renderChatiesStable === "function"
            ) {
                renderChatiesStable(true);
            }
        }
    }

    window.Chad.agentIdentity = {
        normalizeUrl,
        currentChatUrl,
        sameUrl,
        loadJSON,
        saveJSON,
        getAgents,
        saveAgents,
        getActiveId,
        setActiveId,
        getExpandedMap,
        setExpandedMap,
        isExpanded,
        toggleExpanded,
        setExpanded,
        syncActiveAgentToCurrentUrl
    };
})();
