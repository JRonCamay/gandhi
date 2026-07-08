window.TransforkNew = window.TransforkNew || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.DebugManager.js.beginSession", file: "TransforkNew/DebugManager.js", functionName: "beginSession", purpose: "local process member registration for beginSession", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.DebugManager.js.beginStation", file: "TransforkNew/DebugManager.js", functionName: "beginStation", purpose: "local process member registration for beginStation", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.DebugManager.js.endSession", file: "TransforkNew/DebugManager.js", functionName: "endSession", purpose: "local process member registration for endSession", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.DebugManager.js.failSession", file: "TransforkNew/DebugManager.js", functionName: "failSession", purpose: "local process member registration for failSession", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.DebugManager.js.report", file: "TransforkNew/DebugManager.js", functionName: "report", purpose: "local process member registration for report", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.DebugManager.js.setSleeperErrorCatch", file: "TransforkNew/DebugManager.js", functionName: "setSleeperErrorCatch", purpose: "local process member registration for setSleeperErrorCatch", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.DebugManager.js.setRollcallMode", file: "TransforkNew/DebugManager.js", functionName: "setRollcallMode", purpose: "local process member registration for setRollcallMode", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const manager = window.TransforkNew.DebugManager || {
        sleeperErrorCatch: true,
        rollcallMode: false,
        stationId: 0,
        reports: [],
        errors: [],

        beginSession(lineName = "LOADER") {
            this.lineName = lineName;
            this.stationId = 0;
            this.reports = [];
            this.errors = [];
            this.report("beginSession", { lineName });
        },

        beginStation(stationId, memberName) {
            this.stationId = stationId;
            this.report("beginStation", { stationId, memberName });
        },

        endSession(stationId, memberName, report = {}) {
            this.stationId = stationId + 1;
            const entry = {
                status: "done",
                stationId,
                nextStationId: this.stationId,
                memberName,
                report
            };
            this.reports.push(entry);
            this.report("endSession", entry);
            return entry;
        },

        failSession(stationId, memberName, error) {
            const entry = {
                status: "error",
                stationId,
                memberName,
                message: error?.message || String(error),
                stack: error?.stack || ""
            };
            this.errors.push(entry);
            if (this.sleeperErrorCatch) {
                console.error("[TN SLEEPER ERROR]", entry);
            }
            return entry;
        },

        report(label, data) {
            if (!this.rollcallMode) return;
            console.log("[TN DEBUG MANAGER] " + label, data);
        },

        setSleeperErrorCatch(value) {
            this.sleeperErrorCatch = Boolean(value);
        },

        setRollcallMode(value) {
            this.rollcallMode = Boolean(value);
        }
    };

    window.TransforkNew.DebugManager = manager;
    window.TransforkNew.DEBUG_MANAGER = manager;
})();
