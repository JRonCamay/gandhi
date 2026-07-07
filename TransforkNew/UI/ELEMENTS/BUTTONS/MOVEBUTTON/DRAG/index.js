window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    const manager = DRAG.manager || {
        line: "MOVE_DRAG",
        currStation: 0,
        setStation(station) {
            this.currStation = station;
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
    DRAG.setStation = station => manager.setStation(station);
    DRAG.guard = (station, file, functionName) => manager.guard(station, file, functionName);
    DRAG.sleeper = (error, file, functionName, station) => manager.sleeper(error, file, functionName, station);
})();
