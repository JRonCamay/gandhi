window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/04_drawable.js";
    const LINE = "MAIN";
    const STATION = 4;
    const ID = "FACTORY.04.drawable";
    const PURPOSE = "main factory read selected drawable";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "drawable", purpose: PURPOSE, line: LINE, station: STATION });

    function drawable(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "drawable")) return state;
        try {
            state.drawable = state.target ? window.TransforkNew.SYSTEM?.VM?.getDrawable?.(state.target) : null;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station drawable", state.drawable);
            return state;
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " drawable", error);
            return state;
        }
    }

    window.TransforkNew.FACTORY.drawable = drawable;
})();
