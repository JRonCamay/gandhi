window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/INPUT/keyboard.js";
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

    const keyboard = {
        enabled: false,

        init() {
            if (!manager()?.guard?.(0, FILE, "keyboard.init")) return { status: "stop", reason: "KEY guardian blocked keyboard.init" };

            try {
                this.enabled = true;
                return { status: "done", file: FILE, functionName: "keyboard.init" };
            } catch (error) {
                sleeper(error, "keyboard.init", 0);
                return { status: "stop", reason: "keyboard.init crashed", error };
            }
        }
    };

    api.SYSTEM?.REGISTRY?.register?.({
        id: "INPUT.keyboard.init",
        file: FILE,
        functionName: "keyboard.init",
        purpose: "initializes INPUT keyboard member",
        manager: "KEY",
        station: 0
    });

    api.INPUT.keyboard = keyboard;
})();
