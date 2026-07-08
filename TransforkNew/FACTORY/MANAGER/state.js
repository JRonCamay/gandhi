window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.MANAGER.state.js.module", file: "TransforkNew/FACTORY/MANAGER/state.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const state = window.TransforkNew.FACTORY.MANAGER.state || {
        lines: {},
        activeLine: "MAIN",
        debugEnabled: true
    };

    window.TransforkNew.FACTORY.MANAGER.state = state;
})();
