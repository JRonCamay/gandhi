window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/03_selection.js";
    const LINE = "MAIN";
    const STATION = 3;
    const ID = "FACTORY.03.selection";
    const PURPOSE = "main factory read selected target";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "selection", purpose: PURPOSE, line: LINE, station: STATION });

    function selection(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "selection")) return state;
        try {
            state.target = window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station selection", state.target);
            return state;
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " selection", error);
            return state;
        }
    }

    window.TransforkNew.FACTORY.selection = selection;
})();
