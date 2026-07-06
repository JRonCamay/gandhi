window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

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
