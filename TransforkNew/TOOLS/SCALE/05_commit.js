window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.TOOLS.SCALE.05.commit.js.commit", file: "TransforkNew/TOOLS/SCALE/05_commit.js", functionName: "commit", purpose: "local process member registration for commit", manager: "SCALE", station: 5 }
        ].forEach(register);
    })();

    function commit() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_SCALE) return;

        const state = window.TransforkNew.SCALE.state;
        if (!state.active || !state.transform) return;

        state.committed = true;
    }

    window.TransforkNew.SCALE.commit = commit;
})();
