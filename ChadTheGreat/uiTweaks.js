window.Chad = window.Chad || {};

(function () {
    "use strict";

    const PROJECT_TOOLTIPS = {
        ALL: "All Projects — Show tasks from every project.",
        TF: "Transfork — Transform and sprite editing tools.",
        MC: "Mini Console — Scratch VM inspection and quick commands.",
        CH: "ChadTheGreat — Chat-local project companion.",
        GG: "GitGit — GitHub helper and repo workflow tools.",
        BS: "Block Search — Fast Scratch block search and insertion.",
        CP: "Composer — Text-to-block composer for Gandhi IDE.",
        HA: "Home Assistant — Smart home automations and dashboards.",
        OT: "Other — Miscellaneous tasks and notes."
    };

    function getPanel() {
        return document.querySelector("#gandhi-chad-panel");
    }

    function removeUpdateButton() {
        const panel = getPanel();
        if (!panel) return;

        Array.from(panel.querySelectorAll("button")).forEach(button => {
            const text = (button.textContent || "").trim();
            const title = (button.getAttribute("title") || "").trim();

            if (text === "🔄 Update" || title === "Check Chad update") {
                button.remove();
            }
        });
    }

    function addProjectTooltips() {
        const panel = getPanel();
        if (!panel) return;

        Array.from(panel.querySelectorAll("button")).forEach(button => {
            const text = (button.textContent || "").trim();
            if (!PROJECT_TOOLTIPS[text]) return;

            button.title = PROJECT_TOOLTIPS[text];
            button.setAttribute("aria-label", PROJECT_TOOLTIPS[text]);
        });
    }

    function applyTweaks() {
        removeUpdateButton();
        addProjectTooltips();
    }

    function start() {
        applyTweaks();

        const observer = new MutationObserver(() => applyTweaks());
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });

        setInterval(applyTweaks, 1200);
    }

    window.Chad.uiTweaks = {
        applyTweaks,
        removeUpdateButton,
        addProjectTooltips
    };

    start();
})();
