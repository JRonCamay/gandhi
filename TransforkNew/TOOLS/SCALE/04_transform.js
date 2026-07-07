window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    function transform() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_SCALE) return;

        const state = window.TransforkNew.SCALE.state;
        if (!state.active || !state.simulation) return;

        state.transform = {
            simulation: state.simulation
        };
    }

    window.TransforkNew.SCALE.transform = transform;
})();
