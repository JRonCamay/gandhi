window.Chad = window.Chad || {};

(function () {
    "use strict";

    function applyStateSoon() {
        const dock = window.Chad.chadDock;
        if (dock && dock.applySavedState) {
            dock.applySavedState();
        }
    }

    function handleUiStarted() {
        const dock = window.Chad.chadDock;
        if (dock && dock.onUiStarted) {
            dock.onUiStarted();
            return;
        }
        applyStateSoon();
        requestAnimationFrame(applyStateSoon);
        setTimeout(applyStateSoon, 150);
    }

    function patchUiStart() {
        const ui = window.Chad.ui;
        if (!ui || !ui.start || ui.__panelStatePatched) return false;

        const originalStart = ui.start;

        ui.start = function () {
            originalStart.apply(ui, arguments);
            handleUiStarted();
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
        handleUiStarted,
        patchUiStart
    };

    start();
})();
