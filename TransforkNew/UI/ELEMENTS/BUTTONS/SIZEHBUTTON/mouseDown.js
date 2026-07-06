window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SIZEHBUTTON = window.TransforkNew.UI.elements.buttons.SIZEHBUTTON || {};

(function () {
    "use strict";

    function mouseDown(button) {
        if (!button || !button.node) return null;
        button.node.addEventListener("mousedown", event => {
            event.preventDefault();
            event.stopPropagation();
        }, true);
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SIZEHBUTTON.mouseDown = mouseDown;
})();
