window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SIZEWBUTTON = window.TransforkNew.UI.elements.buttons.SIZEWBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SIZEWBUTTON.mouseDown.js.mouseDown", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SIZEWBUTTON/mouseDown.js", functionName: "mouseDown", purpose: "local process member registration for mouseDown", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    function mouseDown(button) {
        if (!button?.node) return null;
        button.node.addEventListener("mousedown", event => {
            event.preventDefault();
            event.stopPropagation();
        }, true);
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SIZEWBUTTON.mouseDown = mouseDown;
})();
