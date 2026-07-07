window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/05_bounds.js";
    const LINE = "MAIN";
    const STATION = 5;
    const ID = "FACTORY.05.bounds";
    const PURPOSE = "main factory read drawable bounds";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "bounds", purpose: PURPOSE, line: LINE, station: STATION });

    function bounds(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "bounds")) return state;
        try {
            state.bounds = state.drawable && typeof state.drawable.getAABB === "function" ? state.drawable.getAABB() : null;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station bounds", state.bounds);
            return state;
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " bounds", error);
            return state;
        }
    }

    window.TransforkNew.FACTORY.bounds = bounds;
})();
