window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/01_system.js";
    const LINE = "MAIN";
    const STATION = 1;
    const ID = "FACTORY.01.system";
    const PURPOSE = "main factory system bootstrap";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "system", purpose: PURPOSE, line: LINE, station: STATION });

    function system(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "system")) return state;
        try {
            state.api = window.TransforkNew;
            return state;
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " system", error);
            return state;
        }
    }

    window.TransforkNew.FACTORY.system = system;
})();
