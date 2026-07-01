window.Chad = window.Chad || {};

(function () {
    "use strict";

    const HOTFIX_FLAG = "__chadHotfixApplied";
    if (window.Chad[HOTFIX_FLAG]) return;
    window.Chad[HOTFIX_FLAG] = true;

    function escapeHTML(text) {
        return String(text || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;");
    }

    function getPanel() {
        return document.querySelector("#gandhi-chad-panel");
    }

    function getSelectedAgent() {
        if (window.Chad.agents && typeof window.Chad.agents.getSelectedAgent === "function") {
            return window.Chad.agents.getSelectedAgent();
        }
        if (window.Chad.ui && typeof window.Chad.ui.getActiveAgent === "function") {
            return window.Chad.ui.getActiveAgent();
        }
        return null;
    }

    function setFavicon(icon) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="48">${escapeHTML(icon || "🤖")}</text></svg>`;
        const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
        let link = document.querySelector("link[data-chad-favicon]");
        if (!link) {
            link = document.createElement("link");
            link.rel = "icon";
            link.dataset.chadFavicon = "1";
            document.head.appendChild(link);
        }
        link.href = url;
    }

    function applySelectedAgentIdentity() {
        const agent = getSelectedAgent();
        if (!agent) return;
        const icon = agent.icon || "🤖";
        const name = agent.name || "Agent";
        document.title = `${icon} ${name} — ChatGPT`;
        setFavicon(icon);
    }

    function removeUpdateButton() {
        const panel = getPanel();
        if (!panel) return;
        const buttons = Array.from(panel.querySelectorAll("button"));
        for (const btn of buttons) {
            const label = (btn.textContent || "").trim().toLowerCase();
            if (label === "🔄 update" || label === "update" || label.includes("update")) {
                btn.remove();
            }
        }
    }

    function preventAutoExpandOnChatiesTab() {
        const panel = getPanel();
        if (!panel) return;
        const btn = panel.querySelector("#gandhi-chad-chaties-tab");
        if (!btn || btn.dataset.hotfixNoAutoExpand) return;

        const clean = btn.cloneNode(true);
        clean.dataset.hotfixNoAutoExpand = "1";
        clean.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            if (window.Chad.storage && window.Chad.storage.state) {
                window.Chad.storage.state.activeTab = "chaties";
            }
            if (window.Chad.ui && typeof window.Chad.ui.render === "function") {
                window.Chad.ui.render();
            }
        }, true);
        btn.replaceWith(clean);
    }

    function fixAgentNameButtons() {
        const panel = getPanel();
        if (!panel || !window.Chad.agents || typeof window.Chad.agents.getAgents !== "function") return;

        const agents = window.Chad.agents.getAgents();
        const buttons = Array.from(panel.querySelectorAll("button"));

        for (const agent of agents) {
            const name = agent.name || "Agent";
            const btn = buttons.find(item => (item.textContent || "").includes(name));
            if (!btn || btn.dataset.hotfixOpenAgent) continue;
            btn.dataset.hotfixOpenAgent = "1";
            btn.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                if (window.Chad.agents && typeof window.Chad.agents.openAgentTab === "function") {
                    window.Chad.agents.openAgentTab(agent).catch(error => alert("Could not open agent tab.\n\n" + error.message));
                }
                applySelectedAgentIdentity();
            }, true);
        }
    }

    function keepHeaderCompact() {
        const panel = getPanel();
        if (!panel) return;
        const header = panel.firstElementChild;
        if (!header) return;
        const top = header.firstElementChild;
        if (!top || !top.lastElementChild) return;
        Object.assign(top.lastElementChild.style, {
            flexWrap: "wrap",
            justifyContent: "flex-end",
            maxWidth: "205px"
        });
    }

    function runHotfixes() {
        removeUpdateButton();
        preventAutoExpandOnChatiesTab();
        fixAgentNameButtons();
        keepHeaderCompact();
        applySelectedAgentIdentity();
    }

    function patchRender() {
        if (!window.Chad.ui || window.Chad.ui.__hotfixRenderPatched) return false;
        const original = window.Chad.ui.render;
        if (typeof original !== "function") return false;

        window.Chad.ui.render = function () {
            const result = original.apply(window.Chad.ui, arguments);
            setTimeout(runHotfixes, 0);
            return result;
        };
        window.Chad.ui.__hotfixRenderPatched = true;
        runHotfixes();
        return true;
    }

    const timer = setInterval(() => {
        if (patchRender()) clearInterval(timer);
    }, 250);

    setTimeout(() => clearInterval(timer), 10000);
})();
