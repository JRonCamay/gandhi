window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};

(function () {
    "use strict";

    function mouseMove(button) {
        return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.EVENTS?.mouseMove?.(button) || null;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.mouseMove = mouseMove;
})();
