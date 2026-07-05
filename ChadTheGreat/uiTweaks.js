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

    function removeCloseButton() {
        const panel = getPanel();
        if (!panel) return;

        Array.from(panel.querySelectorAll("button")).forEach(button => {
            const text = (button.textContent || "").trim();
            if (text === "✕" && button.closest("#gandhi-chad-panel") === panel) {
                button.remove();
            }
        });
    }

    function getHeaderTabRow(panel) {
        const header = panel && panel.firstElementChild;
        if (!header) return null;

        const rows = Array.from(header.children);
        return rows.find(row => {
            const labels = Array.from(row.querySelectorAll("button")).map(button => (button.textContent || "").trim());
            return labels.includes("Chaties") && labels.includes("Notes");
        }) || null;
    }

    function stabilizeHeaderTabs() {
        const panel = getPanel();
        const tabRow = getHeaderTabRow(panel);
        if (!tabRow) return;

        Object.assign(tabRow.style, {
            display: "flex",
            flexWrap: "nowrap",
            overflowX: "auto",
            overflowY: "hidden",
            alignItems: "center",
            gap: "5px",
            paddingBottom: "3px",
            scrollbarWidth: "thin",
            maxWidth: "100%"
        });

        Array.from(tabRow.querySelectorAll("button")).forEach(button => {
            button.style.flex = "0 0 auto";
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
        removeCloseButton();
        stabilizeHeaderTabs();
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
        removeCloseButton,
        stabilizeHeaderTabs,
        addProjectTooltips
    };

    start();
})();
