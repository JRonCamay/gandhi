window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function vm(state = {}) {
        state.vm = window.TransforkNew.SYSTEM?.vm?.get?.() || null;
        window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station vm", {
            vm: state.vm,
            vmState: window.TransforkNew.SYSTEM?.VM?.state
        });
        return state;
    }

    window.TransforkNew.FACTORY.vm = vm;
})();
