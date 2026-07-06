window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const sizeWButton = {
        node: null,

        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-size-w-button";
            api.UI.elements.buttons.SIZEWBUTTON?.draw?.(this);
            api.UI.elements.buttons.SIZEWBUTTON?.mouseDown?.(this);
            api.UI.elements.buttons.SIZEWBUTTON?.mouseMove?.(this);
            api.UI.elements.buttons.SIZEWBUTTON?.mouseUp?.(this);
            api.UI.elements.boundingBox?.node?.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.buttons.sizeWButton = sizeWButton;
})();
