window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    function begin(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_SCALE) return;

        const state = window.TransforkNew.SCALE.state;
        state.active = true;
        state.start = lineState.event || null;
        state.current = lineState.event || null;
    }

    window.TransforkNew.SCALE.begin = begin;
})();
