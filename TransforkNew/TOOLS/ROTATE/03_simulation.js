window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.TOOLS.ROTATE.03.simulation.js.simulation", file: "TransforkNew/TOOLS/ROTATE/03_simulation.js", functionName: "simulation", purpose: "local process member registration for simulation", manager: "ROTATE", station: 3 }
        ].forEach(register);
    })();

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
