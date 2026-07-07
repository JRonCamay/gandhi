window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

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

    window.TransforkNew.SCALE.state = state;
    window.TransforkNew.SCALE.reset = reset;
})();
