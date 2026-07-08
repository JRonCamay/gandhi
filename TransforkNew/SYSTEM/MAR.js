window.TransforkNew = window.TransforkNew || {};

window.TransforkNewMAR = window.TransforkNewMAR || (function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.MAR.js.register", file: "TransforkNew/SYSTEM/MAR.js", functionName: "register", purpose: "local process member registration for register", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.MAR.js.isOn", file: "TransforkNew/SYSTEM/MAR.js", functionName: "isOn", purpose: "local process member registration for isOn", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.MAR.js.set", file: "TransforkNew/SYSTEM/MAR.js", functionName: "set", purpose: "local process member registration for set", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.MAR.js.enable", file: "TransforkNew/SYSTEM/MAR.js", functionName: "enable", purpose: "local process member registration for enable", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.MAR.js.disable", file: "TransforkNew/SYSTEM/MAR.js", functionName: "disable", purpose: "local process member registration for disable", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.MAR.js.get", file: "TransforkNew/SYSTEM/MAR.js", functionName: "get", purpose: "local process member registration for get", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.MAR.js.list", file: "TransforkNew/SYSTEM/MAR.js", functionName: "list", purpose: "local process member registration for list", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

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
