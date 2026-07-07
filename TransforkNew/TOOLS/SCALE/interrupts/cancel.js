window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    function cancel() {
        window.TransforkNew.SCALE.reset?.();
    }

    window.TransforkNew.SCALE.cancel = cancel;
})();
