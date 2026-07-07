window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function system(state = {}) {
        state.api = window.TransforkNew;
        return state;
    }

    window.TransforkNew.FACTORY.system = system;
})();
