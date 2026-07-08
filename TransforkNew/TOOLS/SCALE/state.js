window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.TOOLS.SCALE.state.js.module", file: "TransforkNew/TOOLS/SCALE/state.js", functionName: "module", purpose: "local process member registration for module", manager: "SCALE", station: 0 }
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

    window.TransforkNew.SCALE.state = state;
    window.TransforkNew.SCALE.reset = reset;
})();
