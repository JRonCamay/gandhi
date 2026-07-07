window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    function simulation(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        if (!state.active || !state.captured) return;

        state.simulation = {
            event: lineState.event || null,
            captured: state.captured
        };
    }

    window.TransforkNew.MOVE.simulation = simulation;
})();
