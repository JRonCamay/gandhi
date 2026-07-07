window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    function simulation(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_ROTATE) return;

        const state = window.TransforkNew.ROTATE.state;
        if (!state.active || !state.captured) return;

        state.simulation = {
            event: lineState.event || null,
            captured: state.captured,
            nextDirection: state.captured.direction
        };
    }

    window.TransforkNew.ROTATE.simulation = simulation;
})();
