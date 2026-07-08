window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "KEY.local.TransforkNew.INPUT.shortcuts.js.manager", file: "TransforkNew/INPUT/shortcuts.js", functionName: "manager", purpose: "local process member registration for manager", manager: "KEY", station: 0 },
            { id: "KEY.local.TransforkNew.INPUT.shortcuts.js.init", file: "TransforkNew/INPUT/shortcuts.js", functionName: "init", purpose: "local process member registration for init", manager: "KEY", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/INPUT/shortcuts.js";
    const api = window.TransforkNew;

    function manager() {
        return api.KEY_MANAGER || null;
    }

    function sleeper(error, functionName, station) {
        const activeManager = manager();
        if (activeManager && typeof activeManager.sleeper === "function") {
            activeManager.sleeper(error, FILE, functionName, station);
            return;
        }
        api.SYSTEM?.debug?.error?.("KEY sleeper catch", {
            file: FILE,
            functionName,
            station,
            error
        });
    }

    const shortcuts = {
        active: false,

        init() {
            if (!manager()?.guard?.(0, FILE, "shortcuts.init")) return { status: "stop", reason: "KEY guardian blocked shortcuts.init" };

            try {
                const report = api.INPUT.SHORTCUTS?.registerR?.(this);
                this.active = true;
                return report && typeof report === "object" && report.status
                    ? report
                    : { status: "done", file: FILE, functionName: "shortcuts.init" };
            } catch (error) {
                sleeper(error, "shortcuts.init", 0);
                return { status: "stop", reason: "shortcuts.init crashed", error };
            }
        }
    };

    api.SYSTEM?.REGISTRY?.register?.({
        id: "INPUT.shortcuts.init",
        file: FILE,
        functionName: "shortcuts.init",
        purpose: "initializes INPUT shortcut members and registers R",
        manager: "KEY",
        station: 0
    });

    api.INPUT.shortcuts = shortcuts;
})();
