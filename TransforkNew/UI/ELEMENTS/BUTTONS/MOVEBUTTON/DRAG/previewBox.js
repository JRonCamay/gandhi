window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    function previewBox(button) {
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        if (!button || !box) return null;
        return window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW?.applyDelta?.(box, button.dragDx, button.dragDy);
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewBox = previewBox;
})();
