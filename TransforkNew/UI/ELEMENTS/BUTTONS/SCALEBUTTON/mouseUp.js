window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SCALEBUTTON = window.TransforkNew.UI.elements.buttons.SCALEBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.mouseUp.js.mouseUp", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/mouseUp.js", functionName: "mouseUp", purpose: "local process member registration for mouseUp", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    function mouseUp(button) {
        if (!button?.node) return null;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SCALEBUTTON.mouseUp = mouseUp;
})();
