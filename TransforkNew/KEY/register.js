(function () {
    "use strict";

    const api = window.KEY || {};
    const registry = api.registry || api.shortcuts || [];
    let legacyId = 0;

    function register(shortcut) {
        if (typeof shortcut === "function") {
            legacyId += 1;
            registry.push({
                id: "legacy." + legacyId,
                run: event => shortcut(event)
            });
            return;
        }

        if (!shortcut || typeof shortcut.run !== "function") return;
        if (!shortcut.id) shortcut.id = "shortcut." + (registry.length + 1);
        registry.push(shortcut);
    }

    function unregister(id) {
        const index = registry.findIndex(shortcut => shortcut.id === id);
        if (index !== -1) registry.splice(index, 1);
    }

    function findShortcut(event) {
        const matcher = typeof api.shortcutMatches === "function"
            ? api.shortcutMatches
            : api.defaultFindShortcut;

        for (const shortcut of registry) {
            if (matcher(event, shortcut)) return shortcut;
        }
        return null;
    }

    Object.assign(api, {
        registry,
        shortcuts: registry,
        register,
        unregister,
        findShortcut
    });

    window.KEY = api;
})();
