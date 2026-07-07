window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    function cancel() {
        window.TransforkNew.MOVE.reset?.();
    }

    window.TransforkNew.MOVE.cancel = cancel;
})();
