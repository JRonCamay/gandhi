window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    function commit() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        if (!state.active || !state.transform) return;

        state.committed = true;
    }

    window.TransforkNew.MOVE.commit = commit;
})();
