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
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BUTTONS.rotateButton.js.init", file: "TransforkNew/UI/ELEMENTS/BUTTONS/rotateButton.js", functionName: "init", purpose: "local process member registration for init", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    const rotateButton = {
        node: null,

        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-rotate-button";
            api.UI.elements.buttons.ROTATEBUTTON?.draw?.(this);
            api.UI.elements.buttons.ROTATEBUTTON?.mouseDown?.(this);
            api.UI.elements.buttons.ROTATEBUTTON?.mouseMove?.(this);
            api.UI.elements.buttons.ROTATEBUTTON?.mouseUp?.(this);
            api.UI.elements.boundingBox?.node?.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.buttons.rotateButton = rotateButton;
})();
