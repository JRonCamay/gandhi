window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    function capture(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        if (!state.active) return;

        state.captured = {
            event: lineState.event || null,
            target: window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null,
            drawable: window.TransforkNew.SYSTEM?.VM?.getDrawable?.() || null
        };
    }

    window.TransforkNew.MOVE.capture = capture;
})();
