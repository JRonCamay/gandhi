window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.TOOLS.ROTATE.01.begin.js.begin", file: "TransforkNew/TOOLS/ROTATE/01_begin.js", functionName: "begin", purpose: "local process member registration for begin", manager: "ROTATE", station: 1 }
        ].forEach(register);
    })();

    function begin(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_ROTATE) return;

        const state = window.TransforkNew.ROTATE.state;
        state.active = true;
        state.start = lineState.event || null;
        state.current = lineState.event || null;
        state.committed = false;
    }

    window.TransforkNew.ROTATE.begin = begin;
})();
