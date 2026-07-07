window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    const debug = window.TransforkNew.SYSTEM.debug || {
        enabled: true,

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
        }
    };

    window.TransforkNew.SYSTEM.debug = debug;
})();
