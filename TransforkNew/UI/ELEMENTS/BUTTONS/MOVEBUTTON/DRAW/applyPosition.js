window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW || {};

(function () {
    "use strict";

    function applyPosition(button, left, top) {
        if (!button?.node) return null;
        button.previewButtonLeft = left;
        button.previewButtonTop = top;
        button.node.style.left = left + "px";
        button.node.style.top = top + "px";
        button.node.style.display = "flex";
        button.visible = true;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW.applyPosition = applyPosition;
})();
