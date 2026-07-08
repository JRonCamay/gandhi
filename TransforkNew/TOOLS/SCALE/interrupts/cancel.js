window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SCALE = window.TransforkNew.SCALE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.TOOLS.SCALE.interrupts.cancel.js.cancel", file: "TransforkNew/TOOLS/SCALE/interrupts/cancel.js", functionName: "cancel", purpose: "local process member registration for cancel", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    function cancel() {
        window.TransforkNew.SCALE.reset?.();
    }

    window.TransforkNew.SCALE.cancel = cancel;
})();
