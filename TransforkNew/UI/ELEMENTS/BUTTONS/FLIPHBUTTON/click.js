window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.FLIPHBUTTON = window.TransforkNew.UI.elements.buttons.FLIPHBUTTON || {};

(function () {
    "use strict";

    function click(button) {
        if (!button?.node) return null;
        button.node.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.FLIPHBUTTON.click = click;
})();
