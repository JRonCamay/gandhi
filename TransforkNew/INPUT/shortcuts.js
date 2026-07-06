window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const shortcuts = {
        active: false,

        init() {
            api.INPUT.SHORTCUTS?.registerR?.(this);
        }
    };

    api.INPUT.shortcuts = shortcuts;
})();
