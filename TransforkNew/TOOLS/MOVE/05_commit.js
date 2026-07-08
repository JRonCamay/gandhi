window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.TOOLS.MOVE.05.commit.js.commit", file: "TransforkNew/TOOLS/MOVE/05_commit.js", functionName: "commit", purpose: "local process member registration for commit", manager: "MOVE", station: 5 }
        ].forEach(register);
    })();

    function commit() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        if (!state.active || !state.transform) return;

        state.committed = true;
    }

    window.TransforkNew.MOVE.commit = commit;
})();
