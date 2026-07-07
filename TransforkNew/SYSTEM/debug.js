window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    const debug = window.TransforkNew.DEBUG || window.TransforkNew.SYSTEM.debug || {
        enabled: true,
        rollcallEnabled: false,

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
        }
    };

    if (typeof debug.rollcallEnabled !== "boolean") debug.rollcallEnabled = false;
    if (typeof debug.setEnabled !== "function") {
        debug.setEnabled = function (value) { this.enabled = Boolean(value); };
    }
    if (typeof debug.setRollcallEnabled !== "function") {
        debug.setRollcallEnabled = function (value) { this.rollcallEnabled = Boolean(value); };
    }

    window.TransforkNew.DEBUG = debug;
    window.TransforkNew.SYSTEM.debug = debug;
})();
