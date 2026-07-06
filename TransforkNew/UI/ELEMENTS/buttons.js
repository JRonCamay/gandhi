window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const buttons = {
        init() {
            api.UI.elements.buttons.rotateButton?.init?.();
            api.UI.elements.buttons.scaleButton?.init?.();
            api.UI.elements.buttons.moveButton?.init?.();
        }
    };

    api.UI.elements.buttons = api.UI.elements.buttons || {};
    Object.assign(api.UI.elements.buttons, buttons);
})();
