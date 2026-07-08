window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.TOOLS.SCALE.03.simulation.js.simulation", file: "TransforkNew/TOOLS/SCALE/03_simulation.js", functionName: "simulation", purpose: "local process member registration for simulation", manager: "SCALE", station: 3 }
        ].forEach(register);
    })();

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
