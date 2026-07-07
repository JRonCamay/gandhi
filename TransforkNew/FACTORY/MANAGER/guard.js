window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    function guard(lineId, stationId, file, functionName) {
        const line = window.TransforkNew.FACTORY.MANAGER.state?.lines?.[lineId];
        const allowed = !!line && line.currStation === stationId;
        if (!allowed && window.TransforkNew.FACTORY.MANAGER.state?.debugEnabled) {
            console.warn("[TransforkNew MANAGER] guard blocked", {
                line: lineId,
                expectedStation: stationId,
                currentStation: line?.currStation,
                file,
                functionName
            });
        }
        return allowed;
    }

    window.TransforkNew.FACTORY.MANAGER.guard = guard;
})();
