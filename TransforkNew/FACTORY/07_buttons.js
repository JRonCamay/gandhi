window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/07_buttons.js";
    const LINE = "MAIN";
    const STATION = 7;
    const ID = "FACTORY.07.buttons";
    const PURPOSE = "main factory initialize buttons";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "buttons", purpose: PURPOSE, line: LINE, station: STATION });

    function buttons(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "buttons")) return state;
        try {
            window.TransforkNew.UI?.elements?.buttons?.init?.();
            return state;
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " buttons", error);
            return state;
        }
    }

    window.TransforkNew.FACTORY.buttons = buttons;
})();
