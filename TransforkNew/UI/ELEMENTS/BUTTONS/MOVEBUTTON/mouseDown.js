window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.mouseDown.js.mouseDown", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/mouseDown.js", functionName: "mouseDown", purpose: "local process member registration for mouseDown", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    function mouseDown(button) {
        return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS?.mouseDown?.(button) || null;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.mouseDown = mouseDown;
})();
