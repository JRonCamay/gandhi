window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    function transform() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_ROTATE) return;

        const state = window.TransforkNew.ROTATE.state;
        if (!state.active || !state.simulation) return;

        state.transform = {
            simulation: state.simulation,
            direction: state.simulation.nextDirection
        };
    }

    window.TransforkNew.ROTATE.transform = transform;
})();
