window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.ROTATEBUTTON = window.TransforkNew.UI.elements.buttons.ROTATEBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "ROTATE.local.TransforkNew.UI.ELEMENTS.BUTTONS.ROTATEBUTTON.mouseUp.js.mouseUp", file: "TransforkNew/UI/ELEMENTS/BUTTONS/ROTATEBUTTON/mouseUp.js", functionName: "mouseUp", purpose: "local process member registration for mouseUp", manager: "ROTATE", station: 0 }
        ].forEach(register);
    })();

    function mouseUp(button) {
        if (!button?.node) return null;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.ROTATEBUTTON.mouseUp = mouseUp;
})();
