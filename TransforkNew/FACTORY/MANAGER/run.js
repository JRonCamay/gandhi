window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    function runLine(lineId, stationList, state = {}) {
        const manager = window.TransforkNew.FACTORY.MANAGER;
        manager.create?.(lineId, { maxStation: stationList.length });

        for (const item of stationList) {
            manager.setStation?.(lineId, item.station);
            const fn = item.fn;
            if (typeof fn !== "function") continue;
            fn(state);
            manager.advance?.(lineId);
        }

        manager.setStation?.(lineId, 0);
        return state;
    }

    window.TransforkNew.FACTORY.MANAGER.runLine = runLine;
})();
