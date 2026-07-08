window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SIZEHBUTTON = window.TransforkNew.UI.elements.buttons.SIZEHBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SIZEHBUTTON.mouseMove.js.mouseMove", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SIZEHBUTTON/mouseMove.js", functionName: "mouseMove", purpose: "local process member registration for mouseMove", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    function mouseMove(button) {
        if (!button || !button.node) return null;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SIZEHBUTTON.mouseMove = mouseMove;
})();
