window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};

(function () {
    "use strict";

    const keyboard = {
        enabled: false,
        init() {
            this.enabled = true;
        }
    };

    window.TransforkNew.INPUT.keyboard = keyboard;
})();
