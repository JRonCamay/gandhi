window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MOVE = window.TransforkNew.MOVE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.TOOLS.MOVE.interrupts.cancel.js.cancel", file: "TransforkNew/TOOLS/MOVE/interrupts/cancel.js", functionName: "cancel", purpose: "local process member registration for cancel", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    function cancel() {
        window.TransforkNew.MOVE.reset?.();
    }

    window.TransforkNew.MOVE.cancel = cancel;
})();
