window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    function makeReport(status, extra = {}) {
        return Object.assign({ status }, extra);
    }

    function stopLine(line, reason, item, state) {
        line.error = reason;
        line.blockedStation = item || null;
        line.currStation = 0;
        if (state) {
            state.error = reason;
            state.failedStation = item?.name || item?.station || null;
        }
        window.TransforkNew.SYSTEM?.debug?.warn?.("MANAGER line stopped", {
            line: line.id,
            reason,
            station: item,
            state
        });
        return makeReport("stop", { reason, station: item });
    }

    function process(lineId, stationList, state = {}) {
        const manager = window.TransforkNew.FACTORY.MANAGER;
        const line = manager.create?.(lineId, { maxStation: stationList.length });
        if (!line) return state;

        while (line.currStation > 0 && line.currStation <= line.maxStation) {
            const item = stationList.find(entry => entry.station === line.currStation);
            if (!item) {
                stopLine(line, "missing station", { station: line.currStation }, state);
                break;
            }

            const fn = item.fn;
            if (typeof fn !== "function") {
                stopLine(line, "missing station function", item, state);
                break;
            }

            let report = null;
            try {
                report = fn(state);
            } catch (error) {
                window.TransforkNew.SYSTEM?.debug?.error?.("MANAGER station crashed", {
                    line: lineId,
                    station: item,
                    error
                });
                stopLine(line, "station crashed", item, state);
                break;
            }

            if (!report || typeof report !== "object" || !report.status) {
                stopLine(line, "station returned no report", item, state);
                break;
            }

            line.lastReport = report;

            if (report.status === "done") {
                line.completed[line.currStation] = true;
                line.currStation += 1;
                continue;
            }

            if (report.status === "wait") {
                window.TransforkNew.SYSTEM?.debug?.log?.("MANAGER station waiting", { line: lineId, station: item, report });
                break;
            }

            if (report.status === "stop") {
                stopLine(line, report.reason || "station stopped", item, state);
                break;
            }

            stopLine(line, "unknown station report", item, state);
            break;
        }

        if (line.currStation > line.maxStation) {
            line.currStation = 0;
            line.complete = true;
        }

        return state;
    }

    function runLine(lineId, stationList, state = {}) {
        const manager = window.TransforkNew.FACTORY.MANAGER;
        const line = manager.create?.(lineId, { maxStation: stationList.length });
        if (!line) return state;
        line.currStation = 1;
        line.maxStation = stationList.length;
        line.complete = false;
        line.error = null;
        return process(lineId, stationList, state);
    }

    window.TransforkNew.FACTORY.MANAGER.report = makeReport;
    window.TransforkNew.FACTORY.MANAGER.process = process;
    window.TransforkNew.FACTORY.MANAGER.runLine = runLine;
})();
