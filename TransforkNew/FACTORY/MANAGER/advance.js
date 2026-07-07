window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    function setStation(lineId, stationId) {
        const manager = window.TransforkNew.FACTORY.MANAGER;
        const line = manager.create?.(lineId) || null;
        if (!line) return null;
        line.currStation = stationId;
        if (manager.state.debugEnabled) {
            console.log("[TransforkNew MANAGER] station", { line: lineId, currStation: stationId });
        }
        return line;
    }

    function advance(lineId) {
        const manager = window.TransforkNew.FACTORY.MANAGER;
        const line = manager.create?.(lineId) || null;
        if (!line) return null;
        line.completed[line.currStation] = true;
        line.currStation += 1;
        if (manager.state.debugEnabled) {
            console.log("[TransforkNew MANAGER] advance", { line: lineId, currStation: line.currStation });
        }
        return line;
    }

    window.TransforkNew.FACTORY.MANAGER.setStation = setStation;
    window.TransforkNew.FACTORY.MANAGER.advance = advance;
})();
