window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.TOOLS.SCALE.02.capture.js.capture", file: "TransforkNew/TOOLS/SCALE/02_capture.js", functionName: "capture", purpose: "local process member registration for capture", manager: "SCALE", station: 2 }
        ].forEach(register);
    })();

    function capture(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_SCALE) return;

        const state = window.TransforkNew.SCALE.state;
        if (!state.active) return;

        state.captured = {
            event: lineState.event || null,
            target: window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null,
            drawable: window.TransforkNew.SYSTEM?.VM?.getDrawable?.() || null
        };
    }

    window.TransforkNew.SCALE.capture = capture;
})();
