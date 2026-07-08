window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.TOOLS.ROTATE.05.commit.js.commit", file: "TransforkNew/TOOLS/ROTATE/05_commit.js", functionName: "commit", purpose: "local process member registration for commit", manager: "ROTATE", station: 5 }
        ].forEach(register);
    })();

    function commit() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_ROTATE) return;

        const state = window.TransforkNew.ROTATE.state;
        if (!state.active || !state.transform) return;

        state.committed = true;
    }

    window.TransforkNew.ROTATE.commit = commit;
})();
