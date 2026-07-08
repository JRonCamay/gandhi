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
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.EVENTS.mouseMove.js.mouseMove", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/EVENTS/mouseMove.js", functionName: "mouseMove", purpose: "local process member registration for mouseMove", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    function mouseMove(button) {
        return button?.node || null;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS.mouseMove = mouseMove;
})();
