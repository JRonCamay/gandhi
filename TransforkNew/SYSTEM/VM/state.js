window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    const state = window.TransforkNew.SYSTEM.VM.state || {
        vm: null,
        ready: false,
        waiting: false,
        timer: null,
        callbacks: []
    };

    window.TransforkNew.SYSTEM.VM.state = state;
})();
