window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.CLEARBUTTON = window.TransforkNew.UI.elements.buttons.CLEARBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BUTTONS.CLEARBUTTON.click.js.click", file: "TransforkNew/UI/ELEMENTS/BUTTONS/CLEARBUTTON/click.js", functionName: "click", purpose: "local process member registration for click", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function click(button) {
        if (!button?.node) return null;
        button.node.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.CLEARBUTTON.click = click;
})();
