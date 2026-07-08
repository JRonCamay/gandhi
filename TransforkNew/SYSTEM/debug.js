window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.debug.js.log", file: "TransforkNew/SYSTEM/debug.js", functionName: "log", purpose: "local process member registration for log", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.debug.js.warn", file: "TransforkNew/SYSTEM/debug.js", functionName: "warn", purpose: "local process member registration for warn", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.debug.js.error", file: "TransforkNew/SYSTEM/debug.js", functionName: "error", purpose: "local process member registration for error", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.debug.js.setEnabled", file: "TransforkNew/SYSTEM/debug.js", functionName: "setEnabled", purpose: "local process member registration for setEnabled", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.debug.js.setRollcallEnabled", file: "TransforkNew/SYSTEM/debug.js", functionName: "setRollcallEnabled", purpose: "local process member registration for setRollcallEnabled", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.debug.js.setSleeperErrorCatch", file: "TransforkNew/SYSTEM/debug.js", functionName: "setSleeperErrorCatch", purpose: "local process member registration for setSleeperErrorCatch", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const debug = window.TransforkNew.DEBUG || window.TransforkNew.SYSTEM.debug || {
        enabled: true,
        rollcallEnabled: false,
        sleeperErrorCatch: true,

        log(label, data) {
            if (!this.enabled) return;
            if (arguments.length > 1) {
                console.log("[TN DEBUG] " + label, data);
                return;
            }
            console.log("[TN DEBUG] " + label);
        },

        warn(label, data) {
            if (!this.enabled) return;
            if (arguments.length > 1) {
                console.warn("[TN DEBUG] " + label, data);
                return;
            }
            console.warn("[TN DEBUG] " + label);
        },

        error(label, error) {
            if (!this.enabled) return;
            console.error("[TN DEBUG] " + label, error);
        },

        setEnabled(value) {
            this.enabled = Boolean(value);
        },

        setRollcallEnabled(value) {
            this.rollcallEnabled = Boolean(value);
        },

        setSleeperErrorCatch(value) {
            this.sleeperErrorCatch = Boolean(value);
        }
    };

    if (typeof debug.rollcallEnabled !== "boolean") debug.rollcallEnabled = false;
    if (typeof debug.sleeperErrorCatch !== "boolean") debug.sleeperErrorCatch = true;
    if (typeof debug.setEnabled !== "function") {
        debug.setEnabled = function (value) { this.enabled = Boolean(value); };
    }
    if (typeof debug.setRollcallEnabled !== "function") {
        debug.setRollcallEnabled = function (value) { this.rollcallEnabled = Boolean(value); };
    }
    if (typeof debug.setSleeperErrorCatch !== "function") {
        debug.setSleeperErrorCatch = function (value) { this.sleeperErrorCatch = Boolean(value); };
    }

    window.TransforkNew.DEBUG = debug;
    window.TransforkNew.SYSTEM.debug = debug;
})();
