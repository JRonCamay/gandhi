window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.TOOLS.ROTATE.04.transform.js.transform", file: "TransforkNew/TOOLS/ROTATE/04_transform.js", functionName: "transform", purpose: "local process member registration for transform", manager: "ROTATE", station: 4 }
        ].forEach(register);
    })();

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
