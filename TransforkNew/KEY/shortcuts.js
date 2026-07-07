(function () {
    "use strict";

    console.log("[R] KEY/shortcuts.js loaded");

    if (!window.KEY || typeof window.KEY.register !== "function") {
        console.error("[R] KEY.register missing", window.KEY);
        return;
    }

    const ownerKey = "transforkNew.rShortcut260707_a8f4qz";

    function requestTransformActivation(event) {
        console.log("[R] =================================");
        console.log("[R] callback entered", event);
        console.log("[R] MAR", window.TransforkNewMAR);

        if (window.TransforkNewMAR && !window.TransforkNewMAR.isOn(ownerKey)) {
            console.warn("[R] stopped: MAR owner is off", ownerKey);
            return false;
        }

        let started = false;

        console.log("[R] TransforkNew", window.TransforkNew);
        console.log("[R] INPUT", window.TransforkNew?.INPUT);
        console.log("[R] SHORTCUTS", window.TransforkNew?.INPUT?.SHORTCUTS);
        console.log("[R] toggleR", window.TransforkNew?.INPUT?.SHORTCUTS?.toggleR);

        try {
            console.log("[R] before toggleR check");

            if (typeof window.TransforkNew?.INPUT?.SHORTCUTS?.toggleR === "function") {
                console.log("[R] calling TransforkNew.INPUT.SHORTCUTS.toggleR()");
                window.TransforkNew.INPUT.SHORTCUTS.toggleR();
                console.log("[R] returned from toggleR()");
                started = true;
            } else {
                console.warn("[R] toggleR missing, setting __TransforkNewPendingR");
                window.__TransforkNewPendingR = true;
            }
        } catch (error) {
            console.error("[R] toggleR crashed", error);
        }

        try {
            console.log("[R] legacy fallback check", window.__TransforkToggleTransformMode);

            if (typeof window.__TransforkToggleTransformMode === "function") {
                console.log("[R] calling legacy __TransforkToggleTransformMode()");
                window.__TransforkToggleTransformMode();
                console.log("[R] returned from legacy __TransforkToggleTransformMode()");
                started = true;
            } else {
                console.warn("[R] legacy fallback missing, setting __TransforkPendingRToggle");
                window.__TransforkPendingRToggle = true;
            }
        } catch (error) {
            console.error("[R] legacy fallback crashed", error);
        }

        console.log("[R] callback finished", { started });
        console.log("[R] =================================");
        return started;
    }

    console.log("[R] registering KEY shortcut", ownerKey);

    window.KEY.register({
        id: "transform.toggle",
        key: "r",
        alt: false,
        ctrl: false,
        shift: false,
        meta: false,
        run(event) {
            console.log("[R] KEY run entered", event);
            return requestTransformActivation(event);
        }
    });

    console.log("[R] KEY shortcut registered", window.KEY.registry || window.KEY.shortcuts);
})();
