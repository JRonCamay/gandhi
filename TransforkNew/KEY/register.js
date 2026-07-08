(function () {
    "use strict";

    const FILE = "TransforkNew/KEY/register.js";
    const api = window.KEY || {};
    const registry = api.registry || api.shortcuts || [];
    let legacyId = 0;

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

    function register(shortcut) {
        if (!manager()?.guard?.(0, FILE, "register")) return false;

        try {
            if (typeof shortcut === "function") {
                legacyId += 1;
                registry.push({
                    id: "legacy." + legacyId,
                    run: event => shortcut(event)
                });
                return true;
            }

            if (!shortcut || typeof shortcut.run !== "function") return false;
            if (!shortcut.id) shortcut.id = "shortcut." + (registry.length + 1);
            registry.push(shortcut);
            return true;
        } catch (error) {
            sleeper(error, "register", 0);
            return false;
        }
    }

    function unregister(id) {
        if (!manager()?.guard?.(0, FILE, "unregister")) return false;

        try {
            const index = registry.findIndex(shortcut => shortcut.id === id);
            if (index !== -1) {
                registry.splice(index, 1);
                return true;
            }
            return false;
        } catch (error) {
            sleeper(error, "unregister", 0);
            return false;
        }
    }

    function findShortcut(event) {
        if (!manager()?.guard?.(2, FILE, "findShortcut")) return null;

        try {
            const matcher = typeof api.shortcutMatches === "function"
                ? api.shortcutMatches
                : api.defaultFindShortcut;

            for (const shortcut of registry) {
                if (matcher(event, shortcut)) return shortcut;
            }
            return null;
        } catch (error) {
            sleeper(error, "findShortcut", 2);
            return null;
        }
    }

    window.TransforkNew?.SYSTEM?.REGISTRY?.register?.({
        id: "KEY.register.register",
        file: FILE,
        functionName: "register",
        purpose: "registers KEY shortcuts",
        manager: "KEY",
        station: 0
    });
    window.TransforkNew?.SYSTEM?.REGISTRY?.register?.({
        id: "KEY.register.unregister",
        file: FILE,
        functionName: "unregister",
        purpose: "unregisters KEY shortcuts",
        manager: "KEY",
        station: 0
    });
    window.TransforkNew?.SYSTEM?.REGISTRY?.register?.({
        id: "KEY.register.findShortcut",
        file: FILE,
        functionName: "findShortcut",
        purpose: "finds a matching KEY shortcut during station 2",
        manager: "KEY",
        station: 2
    });

    Object.assign(api, {
        registry,
        shortcuts: registry,
        register,
        unregister,
        findShortcut
    });

    window.KEY = api;
})();
