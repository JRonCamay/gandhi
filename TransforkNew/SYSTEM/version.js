window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.version.js.module", file: "TransforkNew/SYSTEM/version.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const version = window.TransforkNewLoader?.version || window.TransforkNew?.VERSION || ["1", "2", "5-dev"].join(".");

    window.TransforkNew.VERSION = version;
    window.TransforkNew.SYSTEM.version = {
        value: version,
        label: "TransforkNew v" + version
    };
})();
