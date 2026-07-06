window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    function start() {
        api.UI.elements?.boundingBox?.init?.();
        api.UI.elements?.buttons?.init?.();
    }

    api.UI.ui = {
        start
    };
})();
