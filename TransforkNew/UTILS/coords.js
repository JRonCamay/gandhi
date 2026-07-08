window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UTILS = window.TransforkNew.UTILS || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.UTILS.coords.js.module", file: "TransforkNew/UTILS/coords.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    window.TransforkNew.UTILS.coords = window.TransforkNew.UTILS.coords || {};
})();
