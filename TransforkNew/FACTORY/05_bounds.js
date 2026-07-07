window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function bounds(state = {}) {
        state.bounds = state.drawable && typeof state.drawable.getAABB === "function" ? state.drawable.getAABB() : null;
        return state;
    }

    window.TransforkNew.FACTORY.bounds = bounds;
})();
