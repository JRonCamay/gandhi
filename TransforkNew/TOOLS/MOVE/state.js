window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.TOOLS.MOVE.state.js.module", file: "TransforkNew/TOOLS/MOVE/state.js", functionName: "module", purpose: "local process member registration for module", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    const state = {
        active: false,
        start: null,
        current: null,
        captured: null,
        simulation: null,
        transform: null
    };

    function reset() {
        state.active = false;
        state.start = null;
        state.current = null;
        state.captured = null;
        state.simulation = null;
        state.transform = null;
    }

    window.TransforkNew.MOVE.state = state;
    window.TransforkNew.MOVE.reset = reset;
})();
