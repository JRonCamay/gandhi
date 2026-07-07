window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function drawable(state = {}) {
        state.drawable = state.target ? window.TransforkNew.SYSTEM?.VM?.getDrawable?.(state.target) : null;
        window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station drawable", state.drawable);
        return state;
    }

    window.TransforkNew.FACTORY.drawable = drawable;
})();
