(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "KEY.local.TransforkNew.KEY.hotReload.js.manager", file: "TransforkNew/KEY/hotReload.js", functionName: "manager", purpose: "local process member registration for manager", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.hotReload.js.requestHotReload", file: "TransforkNew/KEY/hotReload.js", functionName: "requestHotReload", purpose: "local process member registration for requestHotReload", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.KEY.hotReload.js.run", file: "TransforkNew/KEY/hotReload.js", functionName: "run", purpose: "local process member registration for run", manager: "KEY", station: 0 }
        ].forEach(register);
    })();

    if (!window.KEY || typeof window.KEY.register !== "function") return;

    const FILE = "TransforkNew/KEY/hotReload.js";

    function manager() {
        return window.TransforkNew?.KEY_MANAGER || null;
    }

    function sleeper(error, functionName, station) {
        const activeManager = manager();
        if (activeManager && typeof activeManager.sleeper === "function") {
            activeManager.sleeper(error, FILE, functionName, station);
            return;
        }
        window.TransforkNew?.SYSTEM?.debug?.error?.("KEY sleeper catch", {
            file: FILE,
            functionName,
            station,
            error
        });
    }

    function requestHotReload() {
        if (!manager()?.guard?.(5, FILE, "requestHotReload")) {
            return { status: "stop", reason: "KEY guardian blocked requestHotReload" };
        }

        try {
            let started = false;
            const pending = [];

            try {
                if (window.TransforkNewLoader?.hotReload) {
                    const result = window.TransforkNewLoader.hotReload();
                    started = true;
                    if (result && typeof result.finally === "function") pending.push(result);
                } else {
                    window.__TransforkNewPendingHotReload = true;
                }
            } catch (error) {
                sleeper(error, "requestHotReload.TransforkNewLoader", 5);
                return { status: "stop", reason: "TransforkNewLoader hot reload crashed", error };
            }

            try {
                if (typeof window.TransforkHotReload === "function") {
                    const result = window.TransforkHotReload();
                    started = true;
                    if (result && typeof result.finally === "function") pending.push(result);
                } else {
                    window.__TransforkPendingHotReload = true;
                }
            } catch (error) {
                sleeper(error, "requestHotReload.TransforkHotReload", 5);
                return { status: "stop", reason: "TransforkHotReload crashed", error };
            }

            if (pending.length) {
                return { status: "done", pending: Promise.allSettled(pending) };
            }

            return { status: "done", started };
        } catch (error) {
            sleeper(error, "requestHotReload", 5);
            return { status: "stop", reason: "requestHotReload crashed", error };
        }
    }

    window.TransforkNew?.SYSTEM?.REGISTRY?.register?.({
        id: "KEY.hotReload.requestHotReload",
        file: FILE,
        functionName: "requestHotReload",
        purpose: "runs Alt+R hot reload shortcut",
        manager: "KEY",
        station: 5
    });

    window.KEY.register({
        id: "hotReload.altR",
        key: "r",
        alt: true,
        allowInEditable: true,
        ctrl: false,
        shift: false,
        meta: false,
        run() {
            if (!manager()?.guard?.(5, FILE, "hotReload.run")) {
                return { status: "stop", reason: "KEY guardian blocked hotReload.run" };
            }

            try {
                return requestHotReload();
            } catch (error) {
                sleeper(error, "hotReload.run", 5);
                return { status: "stop", reason: "hotReload.run crashed", error };
            }
        }
    });
})();
