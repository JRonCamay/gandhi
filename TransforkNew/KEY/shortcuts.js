(function () {
    "use strict";

    console.log("[R] KEY/shortcuts.js loaded");

    if (!window.KEY || typeof window.KEY.register !== "function") {
        console.error("[R] KEY.register missing", window.KEY);
        return;
    }

    const FILE = "TransforkNew/KEY/shortcuts.js";
    const ownerKey = "transforkNew.rShortcut260707_a8f4qz";

    window.TransforkNew?.SYSTEM?.REGISTRY?.register?.({
        id: "KEY.shortcuts.requestTransformActivation",
        file: FILE,
        functionName: "requestTransformActivation",
        purpose: "R shortcut requests transform activation",
        manager: "KEY",
        station: 2
    });

    function requestTransformActivation(event) {
        if (!window.TransforkNew?.KEY_MANAGER?.guard?.(2, FILE, "requestTransformActivation")) return false;

        try {
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
                    window.TransforkNew.KEY_MANAGER?.setStation?.(3);
                    window.TransforkNew.INPUT.SHORTCUTS.toggleR();
                    window.TransforkNew.KEY_MANAGER?.setStation?.(2);
                    console.log("[R] returned from toggleR()");
                    started = true;
                } else {
                    console.warn("[R] toggleR missing; no fallback executed");
                }
            } catch (error) {
                window.TransforkNew.KEY_MANAGER?.setStation?.(2);
                window.TransforkNew.KEY_MANAGER?.sleeper?.(error, FILE, "requestTransformActivation.toggleR", 3);
            }

            console.log("[R] callback finished", { started });
            console.log("[R] =================================");
            return started;
        } catch (error) {
            window.TransforkNew.KEY_MANAGER?.sleeper?.(error, FILE, "requestTransformActivation", 2);
            return false;
        }
    }

    console.log("[R] registering KEY shortcut", ownerKey);

    if (window.KEY.shortcuts && window.KEY.shortcuts.some(shortcut => shortcut.id === "transform.toggle")) {
        console.warn("[R] transform.toggle already registered, skipping duplicate");
        return;
    }

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
