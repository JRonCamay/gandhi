window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.TOOLS.MOVE.02.capture.js.capture", file: "TransforkNew/TOOLS/MOVE/02_capture.js", functionName: "capture", purpose: "local process member registration for capture", manager: "MOVE", station: 2 }
        ].forEach(register);
    })();

    function capture(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_MOVE) return;

        const state = window.TransforkNew.MOVE.state;
        if (!state.active) return;

        state.captured = {
            event: lineState.event || null,
            target: window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null,
            drawable: window.TransforkNew.SYSTEM?.VM?.getDrawable?.() || null
        };
    }

    window.TransforkNew.MOVE.capture = capture;
})();
