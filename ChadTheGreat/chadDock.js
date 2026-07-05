window.Chad = window.Chad || {};

(function () {
    "use strict";

    const DOCK_ID = "gandhi-chad-monkey-dock";
    const PANEL_ID = "gandhi-chad-panel";
    const STATE_KEY = "gandhi_chad_panel_state_v1";

    let renderChatiesStable = null;
    let lastActionAt = 0;

    function now() {
        return Date.now();
    }

    function getPanel() {
        return document.querySelector("#" + PANEL_ID);
    }

    function getSavedState() {
        return localStorage.getItem(STATE_KEY) || "closed";
    }

    function saveState(value) {
        localStorage.setItem(STATE_KEY, value === "open" ? "open" : "closed");
    }

    function shouldIgnoreBounce() {
        return now() - lastActionAt < 180;
    }

    function markAction() {
        lastActionAt = now();
    }

    function applySavedState() {
        const panel = getPanel();
        const dock = ensureDock();
        const state = getSavedState();

        if (panel) {
            panel.style.display = state === "open" ? "flex" : "none";
            panel.dataset.chadDockState = state;
        }

        dock.style.display = state === "open" ? "none" : "block";
    }

    function openPanel() {
        markAction();
        saveState("open");
        applySavedState();
    }

    function closePanel() {
        markAction();
        saveState("closed");
        applySavedState();
    }

    function ensureDock(renderCallback) {
        if (typeof renderCallback === "function") {
            renderChatiesStable = renderCallback;
        }

        let dock = document.querySelector("#" + DOCK_ID);
        if (!dock) {
            dock = document.createElement("button");
            dock.id = DOCK_ID;
            dock.textContent = "🐒";
            dock.title = "Open Chad";
            Object.assign(dock.style, {
                position: "fixed",
                right: "18px",
                bottom: "18px",
                zIndex: "1000002",
                width: "58px",
                height: "58px",
                borderRadius: "999px",
                border: "2px solid #f59e0b",
                background: "linear-gradient(135deg,#fef3c7,#fed7aa)",
                fontSize: "31px",
                cursor: "pointer",
                boxShadow: "0 12px 28px rgba(15,23,42,.28)",
                display: "none"
            });

            dock.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();

                openPanel();

                if (typeof renderChatiesStable === "function") {
                    setTimeout(() => renderChatiesStable(true), 0);
                }
            }, true);

            document.body.appendChild(dock);
        }

        return dock;
    }

    function showDock() {
        closePanel();
    }

    function patchCloseButton() {
        const panel = getPanel();
        if (!panel) return;

        const close = Array.from(panel.querySelectorAll("button")).find(btn => {
            return btn.textContent.trim() === "✕" && btn.closest("#" + PANEL_ID) === panel;
        });

        if (!close || close.dataset.chadDockClose === "1") return;
        close.dataset.chadDockClose = "1";

        close.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            if (shouldIgnoreBounce()) return;
            closePanel();
        }, true);
    }

    window.Chad.chadDock = {
        ensureDock,
        showDock,
        openPanel,
        closePanel,
        applySavedState,
        getSavedState,
        patchCloseButton
    };
})();
