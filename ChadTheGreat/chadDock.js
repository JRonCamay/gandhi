window.Chad = window.Chad || {};

(function () {
    "use strict";

    const DOCK_ID = "gandhi-chad-monkey-dock";

    let renderChatiesStable = null;

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
                zIndex: "999998",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                border: "2px solid #fcd34d",
                background: "#fef3c7",
                fontSize: "24px",
                cursor: "pointer",
                boxShadow: "0 8px 24px rgba(15,23,42,.25)",
                display: "none"
            });
            dock.addEventListener("click", () => {
                const panel = document.querySelector("#gandhi-chad-panel");
                if (panel) panel.style.display = "block";
                dock.style.display = "none";
                if (typeof renderChatiesStable === "function") {
                    renderChatiesStable(true);
                }
            });
            document.body.appendChild(dock);
        }
        return dock;
    }

    function showDock() {
        ensureDock().style.display = "block";
    }

    function patchCloseButton() {
        const panel = document.querySelector("#gandhi-chad-panel");
        if (!panel) return;
        const close = Array.from(panel.querySelectorAll("button")).find(btn => btn.textContent.trim() === "✕");
        if (!close || close.dataset.chadDockClose === "1") return;
        close.dataset.chadDockClose = "1";
        close.onclick = event => {
            event.preventDefault();
            event.stopPropagation();
            panel.style.display = "none";
            showDock();
        };
    }

    window.Chad.chadDock = {
        ensureDock,
        showDock,
        patchCloseButton
    };
})();
