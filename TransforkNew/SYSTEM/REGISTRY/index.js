window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.index.js.module", file: "TransforkNew/SYSTEM/REGISTRY/index.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    window.TransforkNew.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY;
})();
