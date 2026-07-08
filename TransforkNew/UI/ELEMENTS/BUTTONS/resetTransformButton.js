window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BUTTONS.resetTransformButton.js.init", file: "TransforkNew/UI/ELEMENTS/BUTTONS/resetTransformButton.js", functionName: "init", purpose: "local process member registration for init", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    const resetTransformButton = {
        node: null,

        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-reset-transform-button";
            api.UI.elements.buttons.CLEARBUTTON?.draw?.(this);
            api.UI.elements.buttons.CLEARBUTTON?.click?.(this);
            api.UI.elements.boundingBox?.node?.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.buttons.resetTransformButton = resetTransformButton;
})();
