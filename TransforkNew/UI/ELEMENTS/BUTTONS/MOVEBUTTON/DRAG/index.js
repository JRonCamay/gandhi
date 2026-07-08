window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.index.js.makeReport", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js", functionName: "makeReport", purpose: "local process member registration for makeReport", manager: "MOVE", station: 0 },
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.index.js.register", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js", functionName: "register", purpose: "local process member registration for register", manager: "MOVE", station: 0 },
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.index.js.start", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js", functionName: "start", purpose: "local process member registration for start", manager: "MOVE", station: 0 },
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.index.js.process", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js", functionName: "process", purpose: "local process member registration for process", manager: "MOVE", station: 0 },
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.index.js.done", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js", functionName: "done", purpose: "local process member registration for done", manager: "MOVE", station: 0 },
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.index.js.wait", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js", functionName: "wait", purpose: "local process member registration for wait", manager: "MOVE", station: 0 },
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.index.js.stop", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js", functionName: "stop", purpose: "local process member registration for stop", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    function makeReport(status, extra = {}) {
        return Object.assign({ status }, extra);
    }

    const manager = DRAG.manager || {
        line: "MOVE_DRAG",
        name: "MOVE_DRAG",
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
                    this.submitEndSession();
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

        submitEndSession() {
            this.currStation += 1;
            return this.currStation;
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
    window.TransforkNew.MANAGERS = window.TransforkNew.MANAGERS || {};
    window.TransforkNew.MANAGERS.MOVE_DRAG = manager;
    DRAG.report = makeReport;
    DRAG.start = (context, startStation, endStation) => manager.start(context, startStation, endStation);
    DRAG.registerStation = (station, fn, meta) => manager.register(station, fn, meta);
    DRAG.guard = (station, file, functionName) => manager.guard(station, file, functionName);
    DRAG.done = extra => manager.done(extra);
    DRAG.wait = extra => manager.wait(extra);
    DRAG.stop = (reason, extra) => manager.stop(reason, extra);
    DRAG.sleeper = (error, file, functionName, station) => manager.sleeper(error, file, functionName, station);
})();
