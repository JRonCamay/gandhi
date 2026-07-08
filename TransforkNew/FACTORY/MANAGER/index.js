window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.MANAGER.index.js.module", file: "TransforkNew/FACTORY/MANAGER/index.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    window.TransforkNew.MANAGER = window.TransforkNew.FACTORY.MANAGER;
    ["MAIN", "KEY", "MOVE", "RENDER", "VM"].forEach(line => {
        window.TransforkNew.FACTORY.MANAGER.create?.(line);
    });
    window.TransforkNew.MANAGERS = window.TransforkNew.FACTORY.MANAGER.state.lines;
})();
