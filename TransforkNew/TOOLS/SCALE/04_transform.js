window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.TOOLS.SCALE.04.transform.js.transform", file: "TransforkNew/TOOLS/SCALE/04_transform.js", functionName: "transform", purpose: "local process member registration for transform", manager: "SCALE", station: 4 }
        ].forEach(register);
    })();

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
