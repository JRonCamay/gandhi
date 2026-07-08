window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    function run(button) {
        if (!button) return false;
        button.frameRequested = false;
        const simulation = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.simulate?.(button);
        if (!simulation) return false;
        window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewButton?.(button);
        window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewBox?.(button);
        return true;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.run = run;
})();
