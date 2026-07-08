window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ui.js.start", file: "TransforkNew/UI/ui.js", functionName: "start", purpose: "local process member registration for start", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    function start() {
        api.SYSTEM?.vm?.init?.();
        api.UI.elements?.boundingBox?.init?.();
        api.UI.elements?.buttons?.init?.();
        api.INPUT?.keyboard?.init?.();
        api.INPUT?.shortcuts?.init?.();
    }

    api.UI.ui = {
        start
    };
})();
