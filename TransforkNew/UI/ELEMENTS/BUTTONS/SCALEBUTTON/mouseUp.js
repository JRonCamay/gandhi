window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SCALEBUTTON = window.TransforkNew.UI.elements.buttons.SCALEBUTTON || {};

(function () {
    "use strict";

    function mouseUp(button) {
        if (!button?.node) return null;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SCALEBUTTON.mouseUp = mouseUp;
})();
