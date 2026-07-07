window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function bounds(state = {}) {
        state.bounds = state.drawable && typeof state.drawable.getAABB === "function" ? state.drawable.getAABB() : null;
        window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station bounds", state.bounds);
        return state;
    }

    window.TransforkNew.FACTORY.bounds = bounds;
})();
