window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

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
