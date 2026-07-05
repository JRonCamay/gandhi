window.Chad = window.Chad || {};

(function () {
    "use strict";

    const DOCK_ID = "gandhi-chad-monkey-dock";
    const PANEL_ID = "gandhi-chad-panel";
    const STATE_KEY = "gandhi_chad_panel_state_v1";
    const POS_KEY = "gandhi_chad_monkey_dock_pos_v1";

    let renderChatiesStable = null;
    let lastActionAt = 0;
    let suppressClick = false;

    function now() {
        return Date.now();
    }

    function getPanel() {
        return document.querySelector("#" + PANEL_ID);
    }

    function getSavedState() {
        return localStorage.getItem(STATE_KEY) === "open" ? "open" : "closed";
    }

    function saveState(value) {
        localStorage.setItem(STATE_KEY, value === "open" ? "open" : "closed");
    }

    function loadPosition() {
        try {
            const saved = JSON.parse(localStorage.getItem(POS_KEY) || "null");
            if (saved && Number.isFinite(saved.left) && Number.isFinite(saved.top)) return saved;
        }
        catch {}
        return null;
    }

    function savePosition(pos) {
        localStorage.setItem(POS_KEY, JSON.stringify(pos));
    }

    function clampPosition(left, top) {
        const size = 58;
        const margin = 8;
        return {
            left: Math.max(margin, Math.min(window.innerWidth - size - margin, left)),
            top: Math.max(margin, Math.min(window.innerHeight - size - margin, top))
        };
    }

    function shouldIgnoreBounce() {
        return now() - lastActionAt < 180;
    }

    function markAction() {
        lastActionAt = now();
    }

    function removeDuplicateDocks() {
        Array.from(document.querySelectorAll("button")).forEach(button => {
            if (button.id === DOCK_ID) return;
            if ((button.textContent || "").trim() !== "🐒") return;
            if (button.closest("#" + PANEL_ID)) return;
            button.remove();
        });
    }

    function applyDockPosition(dock) {
        const saved = loadPosition();
        if (saved) {
            const pos = clampPosition(saved.left, saved.top);
            dock.style.left = pos.left + "px";
            dock.style.top = pos.top + "px";
            dock.style.right = "auto";
            dock.style.bottom = "auto";
            return;
        }

        dock.style.left = "auto";
        dock.style.top = "auto";
        dock.style.right = "18px";
        dock.style.bottom = "18px";
    }

    function makeDockDraggable(dock) {
        if (dock.dataset.chadDockDrag === "1") return;
        dock.dataset.chadDockDrag = "1";

        let drag = null;

        function onMove(event) {
            if (!drag) return;
            const dx = event.clientX - drag.startX;
            const dy = event.clientY - drag.startY;
            if (Math.abs(dx) > 3 || Math.abs(dy) > 3) drag.moved = true;

            const pos = clampPosition(drag.left + dx, drag.top + dy);
            dock.style.left = pos.left + "px";
            dock.style.top = pos.top + "px";
            dock.style.right = "auto";
            dock.style.bottom = "auto";
        }

        function onUp() {
            if (!drag) return;
            if (drag.moved) {
                const rect = dock.getBoundingClientRect();
                savePosition(clampPosition(rect.left, rect.top));
                suppressClick = true;
                setTimeout(() => { suppressClick = false; }, 180);
            }
            drag = null;
            window.removeEventListener("pointermove", onMove, true);
            window.removeEventListener("pointerup", onUp, true);
        }

        dock.addEventListener("pointerdown", event => {
            if (event.button !== 0) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            const rect = dock.getBoundingClientRect();
            drag = {
                startX: event.clientX,
                startY: event.clientY,
                left: rect.left,
                top: rect.top,
                moved: false
            };

            window.addEventListener("pointermove", onMove, true);
            window.addEventListener("pointerup", onUp, true);
        }, true);
    }

    function ensureDock(renderCallback) {
        if (typeof renderCallback === "function") {
            renderChatiesStable = renderCallback;
        }

        removeDuplicateDocks();

        let dock = document.querySelector("#" + DOCK_ID);
        if (!dock) {
            dock = document.createElement("button");
            dock.id = DOCK_ID;
            dock.textContent = "🐒";
            dock.title = "Open Chad";
            Object.assign(dock.style, {
                position: "fixed",
                zIndex: "1000002",
                width: "58px",
                height: "58px",
                borderRadius: "999px",
                border: "2px solid #f59e0b",
                background: "linear-gradient(135deg,#fef3c7,#fed7aa)",
                fontSize: "31px",
                cursor: "grab",
                boxShadow: "0 12px 28px rgba(15,23,42,.28)",
                lineHeight: "1",
                touchAction: "none",
                userSelect: "none",
                display: "none"
            });

            dock.addEventListener("click", event => {
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                if (suppressClick) return;

                openPanel();

                if (typeof renderChatiesStable === "function") {
                    setTimeout(() => renderChatiesStable(true), 0);
                }
            }, true);

            document.body.appendChild(dock);
        }

        applyDockPosition(dock);
        makeDockDraggable(dock);
        return dock;
    }

    function applySavedState() {
        const panel = getPanel();
        const dock = ensureDock();
        const state = getSavedState();

        removeDuplicateDocks();

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

    function startupDocked() {
        saveState("closed");
        applySavedState();
    }

    function onUiStarted() {
        startupDocked();
        requestAnimationFrame(startupDocked);
        setTimeout(startupDocked, 150);
        setTimeout(startupDocked, 600);
    }

    function showDock() {
        closePanel();
    }

    function patchPanelButtons() {
        const panel = getPanel();
        if (!panel) return;

        Array.from(panel.querySelectorAll("button")).forEach(button => {
            const text = (button.textContent || "").trim();

            if (text === "✕" && button.dataset.chadDockClose !== "1") {
                button.dataset.chadDockClose = "1";
                button.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    if (shouldIgnoreBounce()) return;
                    closePanel();
                }, true);
            }

            if (text === "🐒" && button.dataset.chadDockButton !== "1") {
                button.dataset.chadDockButton = "1";
                button.addEventListener("click", event => {
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    if (shouldIgnoreBounce()) return;
                    closePanel();
                }, true);
            }
        });
    }

    window.Chad.chadDock = {
        ensureDock,
        showDock,
        openPanel,
        closePanel,
        startupDocked,
        onUiStarted,
        applySavedState,
        getSavedState,
        patchCloseButton: patchPanelButtons,
        patchPanelButtons
    };
})();
