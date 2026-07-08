window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.TOOLS.SCALE.01.begin.js.begin", file: "TransforkNew/TOOLS/SCALE/01_begin.js", functionName: "begin", purpose: "local process member registration for begin", manager: "SCALE", station: 1 }
        ].forEach(register);
    })();

    function begin(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_SCALE) return;

        const state = window.TransforkNew.SCALE.state;
        state.active = true;
        state.start = lineState.event || null;
        state.current = lineState.event || null;
    }

    window.TransforkNew.SCALE.begin = begin;
})();
