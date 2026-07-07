window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    function end(button, event) {
        if (!button?.dragging) return false;
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.run?.(button);
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        if (box) {
            box.baseLeft = box.previewLeft;
            box.baseTop = box.previewTop;
        }
        button.startButtonLeft = button.previewButtonLeft;
        button.startButtonTop = button.previewButtonTop;
        button.dragging = false;
        button.frameRequested = false;
        return true;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.end = end;
})();
