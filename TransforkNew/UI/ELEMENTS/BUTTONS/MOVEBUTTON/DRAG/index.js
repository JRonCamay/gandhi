window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    function makeReport(status, extra = {}) {
        return Object.assign({ status }, extra);
    }

    const manager = DRAG.manager || {
        line: "MOVE_DRAG",
        currStation: 0,
        endStation: 0,
        stations: {},
        context: null,
        lastReport: null,

        register(station, fn, meta = {}) {
            this.stations[station] = { fn, meta };
        },

        start(context, startStation, endStation) {
            this.context = context;
            this.currStation = startStation;
            this.endStation = endStation || startStation;
            return this.process();
        },

        process() {
            while (this.currStation > 0 && this.currStation <= this.endStation) {
                const entry = this.stations[this.currStation];
                if (!entry || typeof entry.fn !== "function") {
                    return this.stop("missing station function");
                }

                let report = null;
                try {
                    report = entry.fn(this.context);
                } catch (error) {
                    this.sleeper(error, entry.meta?.file || "MOVE_DRAG", entry.meta?.functionName || "unknown", this.currStation);
                    return this.stop("station crashed");
                }

                if (!report || typeof report !== "object" || !report.status) {
                    return this.stop("station returned no report");
                }

                this.lastReport = report;

                if (report.status === "done") {
                    this.currStation += 1;
                    continue;
                }

                if (report.status === "wait") return report;
                if (report.status === "stop") return this.stop(report.reason || "station stopped");
                return this.stop("unknown station report");
            }

            this.currStation = 0;
            return makeReport("done", { line: this.line });
        },

        guard(station, file, functionName) {
            const allowed = this.currStation === station;
            if (!allowed) {
                window.TransforkNew.SYSTEM?.debug?.warn?.("MOVE_DRAG guardian blocked", {
                    file,
                    functionName,
                    expectedStation: station,
                    currStation: this.currStation
                });
            }
            return allowed;
        },

        done(extra = {}) {
            return makeReport("done", extra);
        },

        wait(extra = {}) {
            return makeReport("wait", extra);
        },

        stop(reason, extra = {}) {
            this.currStation = 0;
            return makeReport("stop", Object.assign({ reason }, extra));
        },

        sleeper(error, file, functionName, station) {
            window.TransforkNew.SYSTEM?.debug?.error?.("MOVE_DRAG sleeper catch", {
                file,
                functionName,
                station,
                error
            });
        }
    };

    DRAG.manager = manager;
    DRAG.report = makeReport;
    DRAG.start = (context, startStation, endStation) => manager.start(context, startStation, endStation);
    DRAG.registerStation = (station, fn, meta) => manager.register(station, fn, meta);
    DRAG.guard = (station, file, functionName) => manager.guard(station, file, functionName);
    DRAG.done = extra => manager.done(extra);
    DRAG.wait = extra => manager.wait(extra);
    DRAG.stop = (reason, extra) => manager.stop(reason, extra);
    DRAG.sleeper = (error, file, functionName, station) => manager.sleeper(error, file, functionName, station);
})();
