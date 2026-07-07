window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    function simulation(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_SCALE) return;

        const state = window.TransforkNew.SCALE.state;
        if (!state.active || !state.captured) return;

        state.simulation = {
            event: lineState.event || null,
            captured: state.captured
        };
    }

    window.TransforkNew.SCALE.simulation = simulation;
})();
