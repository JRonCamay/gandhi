window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.STATE.reset.js.module", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/reset.js", functionName: "module", purpose: "local process member registration for module", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    function reset(button) {
        if (!button) return null;
        const node = button.node || null;
        window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE.create(button);
        button.node = node;
        if (node) node.style.display = "none";
        return button;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE.reset = reset;
})();
