window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.TOOLS.MOVE.01.begin.js.begin", file: "TransforkNew/TOOLS/MOVE/01_begin.js", functionName: "begin", purpose: "local process member registration for begin", manager: "MOVE", station: 1 }
        ].forEach(register);
    })();

    function begin(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        state.active = true;
        state.start = lineState.event || null;
        state.current = lineState.event || null;
    }

    window.TransforkNew.MOVE.begin = begin;
})();
