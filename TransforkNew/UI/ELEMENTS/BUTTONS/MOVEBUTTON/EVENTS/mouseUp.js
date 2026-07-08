window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.EVENTS.mouseUp.js.mouseUp", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/EVENTS/mouseUp.js", functionName: "mouseUp", purpose: "local process member registration for mouseUp", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    function mouseUp(button) {
        return button?.node || null;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS.mouseUp = mouseUp;
})();
