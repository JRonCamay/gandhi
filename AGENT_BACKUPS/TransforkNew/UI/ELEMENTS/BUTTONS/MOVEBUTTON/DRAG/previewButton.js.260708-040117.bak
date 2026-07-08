window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    function previewButton(button) {
        if (!button) return null;
        const left = button.startButtonLeft + button.dragDx;
        const top = button.startButtonTop + button.dragDy;
        return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW?.applyPosition?.(button, left, top);
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewButton = previewButton;
})();
