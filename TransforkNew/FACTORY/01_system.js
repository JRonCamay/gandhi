window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.01.system.js.system", file: "TransforkNew/FACTORY/01_system.js", functionName: "system", purpose: "local process member registration for system", manager: "MAIN", station: 1 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/FACTORY/01_system.js";
    const LINE = "MAIN";
    const STATION = 1;
    const ID = "FACTORY.01.system";
    const PURPOSE = "main factory system bootstrap";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "system", purpose: PURPOSE, line: LINE, station: STATION });

    function system(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "system")) return { status: "stop", reason: "guardian blocked", station: STATION };
        try {
            state.api = window.TransforkNew;
            return { status: "done", station: STATION };
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " system", error);
            return { status: "stop", reason: "system crashed", station: STATION, error };
        }
    }

    window.TransforkNew.FACTORY.system = system;
})();
