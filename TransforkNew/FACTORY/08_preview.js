window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.08.preview.js.preview", file: "TransforkNew/FACTORY/08_preview.js", functionName: "preview", purpose: "local process member registration for preview", manager: "MAIN", station: 8 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/FACTORY/08_preview.js";
    const LINE = "MAIN";
    const STATION = 8;
    const ID = "FACTORY.08.preview";
    const PURPOSE = "main factory preview readiness";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "preview", purpose: PURPOSE, line: LINE, station: STATION });

    function preview(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "preview")) return { status: "stop", reason: "guardian blocked", station: STATION };
        try {
            state.previewReady = true;
            return { status: "done", station: STATION };
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " preview", error);
            return { status: "stop", reason: "preview crashed", station: STATION, error };
        }
    }

    window.TransforkNew.FACTORY.preview = preview;
})();
