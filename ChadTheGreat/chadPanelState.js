window.Chad = window.Chad || {};

(function () {
    "use strict";

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
            originalStart.apply(ui, arguments);
            applyStateSoon();
            requestAnimationFrame(applyStateSoon);
            setTimeout(applyStateSoon, 150);
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
        patchUiStart
    };

    start();
})();
