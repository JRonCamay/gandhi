window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    function capture(button, event) {
        if (!button?.dragging) return false;
        event.preventDefault();
        event.stopPropagation();
        button.latestMouseX = event.clientX;
        button.latestMouseY = event.clientY;
        if (!button.frameRequested) {
            button.frameRequested = true;
            requestAnimationFrame(() => window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.run?.(button));
        }
        return true;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.capture = capture;
})();
