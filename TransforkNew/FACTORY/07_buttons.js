window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.07.buttons.js.buttons", file: "TransforkNew/FACTORY/07_buttons.js", functionName: "buttons", purpose: "local process member registration for buttons", manager: "MAIN", station: 7 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/FACTORY/07_buttons.js";
    const LINE = "MAIN";
    const STATION = 7;
    const ID = "FACTORY.07.buttons";
    const PURPOSE = "main factory initialize buttons";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "buttons", purpose: PURPOSE, line: LINE, station: STATION });

    function buttons(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "buttons")) return { status: "stop", reason: "guardian blocked", station: STATION };
        try {
            window.TransforkNew.UI?.elements?.buttons?.init?.();
            return { status: "done", station: STATION };
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " buttons", error);
            return { status: "stop", reason: "buttons crashed", station: STATION, error };
        }
    }

    window.TransforkNew.FACTORY.buttons = buttons;
})();
