window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/10_done.js";
    const LINE = "MAIN";
    const STATION = 10;
    const ID = "FACTORY.10.exit";
    const PURPOSE = "main factory finish line";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "doneStation", purpose: PURPOSE, line: LINE, station: STATION });

    function doneStation(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "doneStation")) return { status: "stop", reason: "guardian blocked", station: STATION };
        try {
            state.complete = true;
            return { status: "done", station: STATION };
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " doneStation", error);
            return { status: "stop", reason: "doneStation crashed", station: STATION, error };
        }
    }

    window.TransforkNew.FACTORY.exit = doneStation;
})();
