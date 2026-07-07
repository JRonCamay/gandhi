window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const stations = ["system", "vm", "selection", "drawable", "bounds", "boundingBox", "buttons", "refresh", "exit"];

    function run(state = {}) {
        window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY run start", state);
        for (const station of stations) {
            const fn = window.TransforkNew.FACTORY?.[station];
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY before " + station, state);
            if (typeof fn !== "function") {
                window.TransforkNew.SYSTEM?.debug?.warn?.("FACTORY missing station " + station);
                continue;
            }
            try {
                fn(state);
            } catch (error) {
                window.TransforkNew.SYSTEM?.debug?.error?.("FACTORY station failed " + station, error);
                state.error = error;
                state.failedStation = station;
                break;
            }
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY after " + station, state);
        }
        window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY run end", state);
        return state;
    }

    window.TransforkNew.FACTORY.run = run;
})();
