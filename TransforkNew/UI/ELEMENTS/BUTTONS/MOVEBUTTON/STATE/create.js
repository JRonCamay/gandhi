window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE || {};

(function () {
    "use strict";

    function create(existing = {}) {
        return Object.assign(existing, {
            node: existing.node || null,
            visible: false,
            dragging: false,
            startMouseX: 0,
            startMouseY: 0,
            latestMouseX: 0,
            latestMouseY: 0,
            startButtonLeft: 0,
            startButtonTop: 0,
            previewButtonLeft: 0,
            previewButtonTop: 0,
            dragDx: 0,
            dragDy: 0,
            frameRequested: false
        });
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE.create = create;
})();
