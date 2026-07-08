window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.TOOLS.MOVE.04.transform.js.transform", file: "TransforkNew/TOOLS/MOVE/04_transform.js", functionName: "transform", purpose: "local process member registration for transform", manager: "MOVE", station: 4 }
        ].forEach(register);
    })();

    function transform() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        if (!state.active || !state.simulation) return;

        state.transform = {
            simulation: state.simulation
        };
    }

    window.TransforkNew.MOVE.transform = transform;
})();
