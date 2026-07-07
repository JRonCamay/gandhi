window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function get() {
        const state = window.TransforkNew.SYSTEM.VM.state;
        return state?.vm || null;
    }

    function isReady() {
        const state = window.TransforkNew.SYSTEM.VM.state;
        return !!(state?.ready && state.vm);
    }

    window.TransforkNew.SYSTEM.VM.get = get;
    window.TransforkNew.SYSTEM.VM.isReady = isReady;
})();
