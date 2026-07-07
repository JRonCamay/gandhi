(function () {
    "use strict";

    if (!window.KEY || typeof window.KEY.register !== "function") return;

    const ownerKey = "transforkNew.rShortcut260707_a8f4qz";

    function requestTransformActivation() {
        if (window.TransforkNewMAR && !window.TransforkNewMAR.isOn(ownerKey)) return false;

        let started = false;

        try {
            if (window.TransforkNew?.INPUT?.SHORTCUTS?.toggleR) {
                window.TransforkNew.INPUT.SHORTCUTS.toggleR();
                started = true;
            } else {
                window.__TransforkNewPendingR = true;
            }
        } catch (_) {}

        try {
            if (typeof window.__TransforkToggleTransformMode === "function") {
                window.__TransforkToggleTransformMode();
                started = true;
            } else {
                window.__TransforkPendingRToggle = true;
            }
        } catch (_) {}

        return started;
    }

    window.KEY.register({
        id: "transform.toggle",
        key: "r",
        alt: false,
        ctrl: false,
        shift: false,
        meta: false,
        run() {
            return requestTransformActivation();
        }
    });
})();
