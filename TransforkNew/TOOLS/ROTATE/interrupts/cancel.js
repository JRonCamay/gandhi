window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    function cancel() {
        window.TransforkNew.ROTATE.reset?.();
    }

    window.TransforkNew.ROTATE.cancel = cancel;
})();
