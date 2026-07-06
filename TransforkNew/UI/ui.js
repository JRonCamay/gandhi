window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    function start() {
        api.SYSTEM?.vm?.init?.();
        api.UI.elements?.boundingBox?.init?.();
        api.UI.elements?.buttons?.init?.();
        api.INPUT?.keyboard?.init?.();
        api.INPUT?.shortcuts?.init?.();
    }

    api.UI.ui = {
        start
    };
})();
