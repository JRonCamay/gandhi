window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    function begin(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        state.active = true;
        state.start = lineState.event || null;
        state.current = lineState.event || null;
    }

    window.TransforkNew.MOVE.begin = begin;
})();
