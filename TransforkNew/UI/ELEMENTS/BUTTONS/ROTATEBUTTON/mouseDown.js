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
            { id: "ROTATE.local.TransforkNew.UI.ELEMENTS.BUTTONS.ROTATEBUTTON.mouseDown.js.mouseDown", file: "TransforkNew/UI/ELEMENTS/BUTTONS/ROTATEBUTTON/mouseDown.js", functionName: "mouseDown", purpose: "local process member registration for mouseDown", manager: "ROTATE", station: 0 }
        ].forEach(register);
    })();

    function mouseDown(button) {
        if (!button?.node) return null;
        button.node.addEventListener("mousedown", event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            window.TransforkNew.TOOLS?.activate?.(window.TransforkNew.TOOLS?.state?.TOOL_ROTATE);
            window.TransforkNew.TOOLS?.factoryLine?.run?.({ id: "rotate.factoryLine", event });
        }, true);
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.ROTATEBUTTON.mouseDown = mouseDown;
})();
