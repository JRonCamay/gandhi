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
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BUTTONS.scaleButton.js.init", file: "TransforkNew/UI/ELEMENTS/BUTTONS/scaleButton.js", functionName: "init", purpose: "local process member registration for init", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    const scaleButton = {
        node: null,

        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-scale-button";
            api.UI.elements.buttons.SCALEBUTTON?.draw?.(this);
            api.UI.elements.buttons.SCALEBUTTON?.mouseDown?.(this);
            api.UI.elements.buttons.SCALEBUTTON?.mouseMove?.(this);
            api.UI.elements.buttons.SCALEBUTTON?.mouseUp?.(this);
            api.UI.elements.boundingBox?.node?.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.buttons.scaleButton = scaleButton;
})();
