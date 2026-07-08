window.TransforkNew = window.TransforkNew || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.Transfork.Main.js.start", file: "TransforkNew/Transfork_Main.js", functionName: "start", purpose: "local process member registration for start", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    function start() {
        api.UI?.ui?.start?.();
    }

    api.main = {
        start
    };

    start();
})();
