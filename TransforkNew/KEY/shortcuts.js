(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "KEY.local.TransforkNew.KEY.shortcuts.js.requestTransformActivation", file: "TransforkNew/KEY/shortcuts.js", functionName: "requestTransformActivation", purpose: "local process member registration for requestTransformActivation", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.shortcuts.js.run", file: "TransforkNew/KEY/shortcuts.js", functionName: "run", purpose: "local process member registration for run", manager: "KEY", station: 0 }
        ].forEach(register);
    })();

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
        station: 5
    });

    function requestTransformActivation(event) {
        if (!window.TransforkNew?.KEY_MANAGER?.guard?.(5, FILE, "requestTransformActivation")) {
            return { status: "stop", reason: "KEY guardian blocked requestTransformActivation" };
        }

        try {
            console.log("[R] =================================");
            console.log("[R] callback entered", event);
            console.log("[R] MAR", window.TransforkNewMAR);

            if (window.TransforkNewMAR && !window.TransforkNewMAR.isOn(ownerKey)) {
                console.warn("[R] stopped: MAR owner is off", ownerKey);
                return { status: "stop", reason: "MAR owner off" };
            }

            console.log("[R] TransforkNew", window.TransforkNew);
            console.log("[R] INPUT", window.TransforkNew?.INPUT);
            console.log("[R] SHORTCUTS", window.TransforkNew?.INPUT?.SHORTCUTS);
            console.log("[R] toggleR", window.TransforkNew?.INPUT?.SHORTCUTS?.toggleR);

            if (typeof window.TransforkNew?.INPUT?.SHORTCUTS?.toggleR !== "function") {
                console.warn("[R] toggleR missing; no fallback executed");
                return { status: "stop", reason: "toggleR missing" };
            }

            const report = window.TransforkNew.INPUT.SHORTCUTS.toggleR();
            if (!report || typeof report !== "object" || !report.status) {
                return { status: "stop", reason: "toggleR returned no report" };
            }

            console.log("[R] callback finished", report);
            console.log("[R] =================================");
            return report;
        } catch (error) {
            window.TransforkNew.KEY_MANAGER?.sleeper?.(error, FILE, "requestTransformActivation", 5);
            return { status: "stop", reason: "requestTransformActivation crashed", error };
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
