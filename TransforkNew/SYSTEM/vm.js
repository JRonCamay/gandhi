window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const vm = {
        init(callback) {
            return api.SYSTEM.VM?.waitForVM?.(found => {
                if (typeof callback === "function") callback(found);
            }) || null;
        },

        get() {
            return api.SYSTEM.VM?.get?.() || api.SYSTEM.VM?.waitForVM?.() || null;
        },

        isReady() {
            return api.SYSTEM.VM?.isReady?.() || false;
        }
    };

    api.SYSTEM.vm = vm;
})();
