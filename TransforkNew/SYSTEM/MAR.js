window.TransforkNew = window.TransforkNew || {};

window.TransforkNewMAR = window.TransforkNewMAR || (function () {
    "use strict";

    const registry = Object.create(null);

    function register(entry) {
        if (!entry || !entry.key) {
            throw new Error("MAR.register requires entry.key");
        }

        const current = registry[entry.key];

        if (!current || (entry.timestamp || 0) >= (current.timestamp || 0)) {
            registry[entry.key] = {
                key: entry.key,
                creator: entry.creator || current?.creator || "unknown",
                purpose: entry.purpose || current?.purpose || "",
                timestamp: entry.timestamp || current?.timestamp || 0,
                parent: entry.parent || current?.parent || "",
                on: entry.on !== false
            };
        }

        return registry[entry.key];
    }

    function isOn(key) {
        return !!registry[key]?.on;
    }

    function set(key, value) {
        if (registry[key]) registry[key].on = !!value;
    }

    function enable(key) {
        set(key, true);
    }

    function disable(key) {
        set(key, false);
    }

    function get(key) {
        return registry[key] || null;
    }

    function list() {
        return Object.assign({}, registry);
    }

    return {
        register,
        isOn,
        set,
        enable,
        disable,
        get,
        list
    };
})();
