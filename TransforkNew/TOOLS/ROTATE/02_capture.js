window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.TOOLS.ROTATE.02.capture.js.capture", file: "TransforkNew/TOOLS/ROTATE/02_capture.js", functionName: "capture", purpose: "local process member registration for capture", manager: "ROTATE", station: 2 }
        ].forEach(register);
    })();

    function capture(lineState = {}) {
        if (window.TransforkNew.MAR?.tool !== window.TransforkNew.TOOLS?.state?.TOOL_ROTATE) return;

        const state = window.TransforkNew.ROTATE.state;
        if (!state.active) return;

        const target = window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null;
        const drawable = window.TransforkNew.SYSTEM?.VM?.getDrawable?.() || null;

        state.captured = {
            event: lineState.event || null,
            target,
            drawable,
            direction: target?.direction ?? null
        };
    }

    window.TransforkNew.ROTATE.capture = capture;
})();
