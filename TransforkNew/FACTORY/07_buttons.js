window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function buttons(state = {}) {
        window.TransforkNew.UI?.elements?.buttons?.init?.();
        return state;
    }

    window.TransforkNew.FACTORY.buttons = buttons;
})();
