window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.buttons.js.init", file: "TransforkNew/UI/ELEMENTS/buttons.js", functionName: "init", purpose: "local process member registration for init", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    const buttons = {
        init() {
            api.UI.elements.buttons.rotateButton?.init?.();
            api.UI.elements.buttons.scaleButton?.init?.();
            api.UI.elements.buttons.moveButton?.init?.();
            api.UI.elements.buttons.flipHButton?.init?.();
            api.UI.elements.buttons.flipVButton?.init?.();
            api.UI.elements.buttons.resetTransformButton?.init?.();
            api.UI.elements.buttons.transparencyButton?.init?.();
            api.UI.elements.buttons.sizeWButton?.init?.();
            api.UI.elements.buttons.sizeHButton?.init?.();
        }
    };

    api.UI.elements.buttons = api.UI.elements.buttons || {};
    Object.assign(api.UI.elements.buttons, buttons);
})();
