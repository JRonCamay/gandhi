window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SIZEHBUTTON = window.TransforkNew.UI.elements.buttons.SIZEHBUTTON || {};

(function () {
    "use strict";

    function mouseUp(button) {
        if (!button || !button.node) return null;
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SIZEHBUTTON.mouseUp = mouseUp;
})();
