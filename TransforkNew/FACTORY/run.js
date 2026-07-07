window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/run.js";

    const stations = [
        { station: 1, name: "system" },
        { station: 2, name: "vm" },
        { station: 3, name: "selection" },
        { station: 4, name: "drawable" },
        { station: 5, name: "bounds" },
        { station: 6, name: "boundingBox" },
        { station: 7, name: "buttons" },
        { station: 8, name: "preview" },
        { station: 9, name: "refresh" },
        { station: 10, name: "exit" }
    ];

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({
        id: "FACTORY.run",
        file: FILE,
        functionName: "run",
        purpose: "main factory manager run loop",
        manager: "MAIN",
        station: 0
    });

    function run(state = {}) {
        try {
            const manager = window.TransforkNew.FACTORY.MANAGER;
            if (!manager?.runLine) {
                window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " run", new Error("FACTORY manager missing"));
                return state;
            }

            const stationList = stations.map(item => ({
                station: item.station,
                name: item.name,
                fn: window.TransforkNew.FACTORY?.[item.name]
            }));

            return manager.runLine("MAIN", stationList, state);
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " run", error);
            state.error = error;
            return state;
        }
    }

    window.TransforkNew.FACTORY.run = run;
})();
