window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.find.js.findByPurpose", file: "TransforkNew/SYSTEM/REGISTRY/find.js", functionName: "findByPurpose", purpose: "local process member registration for findByPurpose", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.find.js.findByFile", file: "TransforkNew/SYSTEM/REGISTRY/find.js", functionName: "findByFile", purpose: "local process member registration for findByFile", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.find.js.list", file: "TransforkNew/SYSTEM/REGISTRY/find.js", functionName: "list", purpose: "local process member registration for list", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    function findByPurpose(purpose) {
        return window.TransforkNew.SYSTEM.REGISTRY.state?.byPurpose?.[purpose] || [];
    }

    function findByFile(file) {
        return window.TransforkNew.SYSTEM.REGISTRY.state?.byFile?.[file] || [];
    }

    function list() {
        return Object.values(window.TransforkNew.SYSTEM.REGISTRY.state?.records || {});
    }

    window.TransforkNew.SYSTEM.REGISTRY.findByPurpose = findByPurpose;
    window.TransforkNew.SYSTEM.REGISTRY.findByFile = findByFile;
    window.TransforkNew.SYSTEM.REGISTRY.list = list;
})();
