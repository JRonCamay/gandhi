window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAW.attachToBox.js.attachToBox", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/attachToBox.js", functionName: "attachToBox", purpose: "local process member registration for attachToBox", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    function attachToBox(button, box) {
        if (!button || !box?.visible) return null;
        window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW.createNode?.(button);
        if (!button.node) return null;
        const left = box.previewLeft + (box.width / 2) - 10;
        const top = box.previewTop - 23;
        button.startButtonLeft = left;
        button.startButtonTop = top;
        return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW.applyPosition?.(button, left, top);
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW.attachToBox = attachToBox;
})();
