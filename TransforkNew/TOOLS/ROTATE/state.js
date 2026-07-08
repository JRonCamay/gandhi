window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.TOOLS.ROTATE.state.js.module", file: "TransforkNew/TOOLS/ROTATE/state.js", functionName: "module", purpose: "local process member registration for module", manager: "ROTATE", station: 0 }
        ].forEach(register);
    })();

    const state = {
        active: false,
        start: null,
        current: null,
        captured: null,
        simulation: null,
        transform: null,
        committed: false
    };

    function reset() {
        state.active = false;
        state.start = null;
        state.current = null;
        state.captured = null;
        state.simulation = null;
        state.transform = null;
        state.committed = false;
    }

    window.TransforkNew.ROTATE.state = state;
    window.TransforkNew.ROTATE.reset = reset;
})();
