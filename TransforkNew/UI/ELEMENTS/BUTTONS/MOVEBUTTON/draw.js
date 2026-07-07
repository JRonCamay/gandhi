window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW?.createNode?.(button) || null;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.draw = draw;
})();
