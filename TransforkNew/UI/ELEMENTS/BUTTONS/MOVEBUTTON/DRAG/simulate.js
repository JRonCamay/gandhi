window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    function simulate(button) {
        if (!button?.dragging) return null;
        button.dragDx = button.latestMouseX - button.startMouseX;
        button.dragDy = button.latestMouseY - button.startMouseY;
        return { dx: button.dragDx, dy: button.dragDy };
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.simulate = simulate;
})();
