window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const stations = ["system", "vm", "selection", "drawable", "bounds", "boundingBox", "buttons", "refresh", "exit"];

    function run(state = {}) {
        for (const station of stations) {
            window.TransforkNew.FACTORY?.[station]?.(state);
        }
        return state;
    }

    window.TransforkNew.FACTORY.run = run;
})();
