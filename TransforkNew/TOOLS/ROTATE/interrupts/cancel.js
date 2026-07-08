window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.ROTATE = window.TransforkNew.ROTATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.TOOLS.ROTATE.interrupts.cancel.js.cancel", file: "TransforkNew/TOOLS/ROTATE/interrupts/cancel.js", functionName: "cancel", purpose: "local process member registration for cancel", manager: "ROTATE", station: 0 }
        ].forEach(register);
    })();

    function cancel() {
        window.TransforkNew.ROTATE.reset?.();
    }

    window.TransforkNew.ROTATE.cancel = cancel;
})();
