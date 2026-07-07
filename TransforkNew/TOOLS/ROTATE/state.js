window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

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
