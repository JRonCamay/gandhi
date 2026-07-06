window.TransforkNew = window.TransforkNew || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    function start() {
        api.UI?.ui?.start?.();
    }

    api.main = {
        start
    };

    start();
})();
