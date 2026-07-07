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
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "drawable")) return { status: "stop", reason: "guardian blocked", station: STATION };
        try {
            state.drawable = state.target ? window.TransforkNew.SYSTEM?.VM?.getDrawable?.(state.target) : null;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station drawable", state.drawable);
            if (!state.drawable) return { status: "stop", reason: "drawable missing", station: STATION };
            return { status: "done", station: STATION };
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " drawable", error);
            return { status: "stop", reason: "drawable crashed", station: STATION, error };
        }
    }

    window.TransforkNew.FACTORY.drawable = drawable;
})();
