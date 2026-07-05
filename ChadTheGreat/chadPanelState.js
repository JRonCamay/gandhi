window.Chad = window.Chad || {};

(function () {
    "use strict";

    const STATE_KEY = "gandhi_chad_panel_state_v1";

    function forceStartupDocked() {
        localStorage.setItem(STATE_KEY, "closed");
    }

    function applyStateSoon() {
        if (window.Chad.chadDock && window.Chad.chadDock.applySavedState) {
            window.Chad.chadDock.applySavedState();
        }
    }

    function patchUiStart() {
        const ui = window.Chad.ui;
        if (!ui || !ui.start || ui.__panelStatePatched) return false;

        const originalStart = ui.start;

        ui.start = function () {
            forceStartupDocked();
            originalStart.apply(ui, arguments);
            forceStartupDocked();
            applyStateSoon();
            requestAnimationFrame(() => {
                forceStartupDocked();
                applyStateSoon();
            });
            setTimeout(() => {
                forceStartupDocked();
                applyStateSoon();
            }, 150);
        };

        ui.__panelStatePatched = true;
        return true;
    }

    function start() {
        if (patchUiStart()) return;
        setTimeout(start, 100);
    }

    window.Chad.chadPanelState = {
        applyStateSoon,
        patchUiStart,
        forceStartupDocked
    };

    start();
})();
