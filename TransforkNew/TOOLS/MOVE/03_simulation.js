window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.TOOLS.MOVE.03.simulation.js.simulation", file: "TransforkNew/TOOLS/MOVE/03_simulation.js", functionName: "simulation", purpose: "local process member registration for simulation", manager: "MOVE", station: 3 }
        ].forEach(register);
    })();

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
