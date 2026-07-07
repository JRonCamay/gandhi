window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function vm(state = {}) {
        state.vm = window.TransforkNew.SYSTEM?.vm?.get?.() || null;
        return state;
    }

    window.TransforkNew.FACTORY.vm = vm;
})();
