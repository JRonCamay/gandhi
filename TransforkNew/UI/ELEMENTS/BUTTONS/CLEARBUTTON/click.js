window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.CLEARBUTTON = window.TransforkNew.UI.elements.buttons.CLEARBUTTON || {};

(function () {
    "use strict";

    function click(button) {
        if (!button || !button.node) return null;
        button.node.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
        }, true);
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.CLEARBUTTON.click = click;
})();
