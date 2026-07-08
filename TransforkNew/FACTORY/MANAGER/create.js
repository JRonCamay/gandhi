window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.MANAGER.create.js.create", file: "TransforkNew/FACTORY/MANAGER/create.js", functionName: "create", purpose: "local process member registration for create", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    function create(lineId, options = {}) {
        const state = window.TransforkNew.FACTORY.MANAGER.state;
        window.TransforkNew.MANAGERS = window.TransforkNew.MANAGERS || {};

        if (!state.lines[lineId]) {
            state.lines[lineId] = {
                id: lineId,
                name: lineId,
                currStation: options.currStation || 0,
                maxStation: options.maxStation || 0,
                stations: {},
                completed: {},
                queue: [],

                guard(stationId) {
                    if (this.currStation !== stationId) {
                        window.TransforkNew.DEBUG?.log?.("Guardian blocked", {
                            manager: this.name,
                            expected: stationId,
                            current: this.currStation
                        });
                        return false;
                    }
                    return true;
                },

                submitEndSession() {
                    this.completed[this.currStation] = true;
                    this.currStation++;
                    return this.currStation;
                },

                sleeper(error, entry = {}) {
                    if (!window.TransforkNew.DEBUG?.sleeperErrorCatch) return;
                    console.error("[TN SLEEPER ERROR]", {
                        manager: this.name,
                        currentStation: this.currStation,
                        ...entry,
                        error
                    });
                },

                reset(startStation = 0) {
                    this.currStation = startStation;
                    this.completed = {};
                    this.error = null;
                    this.blockedStation = null;
                    this.complete = false;
                }
            };
        }

        window.TransforkNew.MANAGERS[lineId] = state.lines[lineId];
        return state.lines[lineId];
    }

    window.TransforkNew.FACTORY.MANAGER.create = create;
})();
