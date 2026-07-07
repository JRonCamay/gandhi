window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.FLIPVBUTTON = window.TransforkNew.UI.elements.buttons.FLIPVBUTTON || {};

(function () {
    "use strict";

    function click(button) {
        if (!button?.node) return null;
        button.node.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            window.TransforkNew.FLIP?.flipVertical?.();
        }, true);
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.FLIPVBUTTON.click = click;
})();
