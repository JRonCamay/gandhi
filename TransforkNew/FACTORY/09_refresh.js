window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/09_refresh.js";
    const LINE = "MAIN";
    const STATION = 9;
    const ID = "FACTORY.09.refresh";
    const PURPOSE = "main factory store last refresh";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "refresh", purpose: PURPOSE, line: LINE, station: STATION });

    function refresh(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "refresh")) return state;
        try {
            window.TransforkNew.REFRESH.state.lastRefresh = state;
            return state;
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " refresh", error);
            return state;
        }
    }

    window.TransforkNew.FACTORY.refresh = refresh;
})();
