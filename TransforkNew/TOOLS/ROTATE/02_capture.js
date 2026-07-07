window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

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
