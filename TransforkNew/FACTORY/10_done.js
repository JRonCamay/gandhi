window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function doneStation(state = {}) {
        state.complete = true;
        return state;
    }

    window.TransforkNew.FACTORY.exit = doneStation;
})();
