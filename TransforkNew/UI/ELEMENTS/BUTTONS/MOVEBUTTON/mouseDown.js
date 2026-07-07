window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};

(function () {
    "use strict";

    function mouseDown(button) {
        return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS?.mouseDown?.(button) || null;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.mouseDown = mouseDown;
})();
