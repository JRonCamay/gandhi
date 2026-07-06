window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.ROTATEBUTTON = window.TransforkNew.UI.elements.buttons.ROTATEBUTTON || {};

(function () {
    "use strict";

    function mouseMove(button) {
        if (!button?.node) return null;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.ROTATEBUTTON.mouseMove = mouseMove;
})();
