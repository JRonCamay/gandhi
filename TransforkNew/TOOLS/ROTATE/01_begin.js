window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    function begin(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_ROTATE) return;

        const state = window.TransforkNew.ROTATE.state;
        state.active = true;
        state.start = lineState.event || null;
        state.current = lineState.event || null;
        state.committed = false;
    }

    window.TransforkNew.ROTATE.begin = begin;
})();
