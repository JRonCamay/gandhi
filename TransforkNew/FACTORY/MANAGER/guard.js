window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.MANAGER.guard.js.module", file: "TransforkNew/FACTORY/MANAGER/guard.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    function guard(lineId, stationId, file, functionName) {
        const line = window.TransforkNew.FACTORY.MANAGER.state?.lines?.[lineId];
        const allowed = !!line && line.currStation === stationId;
        if (!allowed && window.TransforkNew.FACTORY.MANAGER.state?.debugEnabled) {
            console.warn("[TransforkNew MANAGER] guard blocked", {
                line: lineId,
                expectedStation: stationId,
                currentStation: line?.currStation,
                file,
                functionName
            });
        }
        return allowed;
    }

    window.TransforkNew.FACTORY.MANAGER.guard = guard;
})();
