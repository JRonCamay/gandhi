window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "RENDER.local.TransforkNew.REFRESH.02.buttons.js.buttons", file: "TransforkNew/REFRESH/02_buttons.js", functionName: "buttons", purpose: "local process member registration for buttons", manager: "RENDER", station: 2 }
        ].forEach(register);
    })();

    function buttons() {
        window.TransforkNew.UI?.elements?.buttons?.init?.();
    }

    window.TransforkNew.REFRESH.buttons = buttons;
})();
