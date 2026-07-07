window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function selection(state = {}) {
        state.target = window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null;
        return state;
    }

    window.TransforkNew.FACTORY.selection = selection;
})();
