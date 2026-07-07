window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    function commit() {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_SCALE) return;

        const state = window.TransforkNew.SCALE.state;
        if (!state.active || !state.transform) return;

        state.committed = true;
    }

    window.TransforkNew.SCALE.commit = commit;
})();
