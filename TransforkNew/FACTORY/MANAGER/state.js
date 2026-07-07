window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    const state = window.TransforkNew.FACTORY.MANAGER.state || {
        lines: {},
        activeLine: "MAIN",
        debugEnabled: true
    };

    window.TransforkNew.FACTORY.MANAGER.state = state;
})();
