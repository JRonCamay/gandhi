window.Chad = window.Chad || {};

window.ChadMAR = window.ChadMAR || (function () {
    "use strict";

    const registry = Object.create(null);

    function register(entry) {
        if (!entry || !entry.key) {
            throw new Error("MAR.register requires entry.key");
        }

        const current = registry[entry.key];

        if (!current) {
            registry[entry.key] = {
                key: entry.key,
                name: entry.name || entry.key,
                file: entry.file || "",
                creator: entry.creator || "unknown",
                purpose: entry.purpose || "",
                timestamp: entry.timestamp || entry.stamp || 0,
                parent: entry.parent || "",
                on: entry.on !== false
            };

            return registry[entry.key];
        }

        if ((entry.timestamp || entry.stamp || 0) >= (current.timestamp || 0)) {
            registry[entry.key] = {
                key: entry.key,
                name: entry.name || current.name,
                file: entry.file || current.file,
                creator: entry.creator || current.creator,
                purpose: entry.purpose || current.purpose,
                timestamp: entry.timestamp || entry.stamp || current.timestamp,
                parent: entry.parent || current.parent,
                on: entry.on !== false
            };
        }

        return registry[entry.key];
    }

    function isOn(key) {
        return !!(registry[key] && registry[key].on);
    }

    function set(key, value) {
        if (registry[key]) {
            registry[key].on = !!value;
        }
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

window.Chad.runtimeSwitchboard = window.ChadMAR;
window.Chad.runtimeSwitchboard260703_m8q4zd = window.ChadMAR;
