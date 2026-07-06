window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const vm = {
        value: null,

        init() {
            this.value = api.SYSTEM.VM?.find?.() || this.value;
            return this.value;
        },

        get() {
            return this.value || this.init();
        }
    };

    api.SYSTEM.vm = vm;
})();
