window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const sizeHButton = {
        node: null,

        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-size-h-button";
            api.UI.elements.buttons.SIZEHBUTTON?.draw?.(this);
            api.UI.elements.buttons.SIZEHBUTTON?.mouseDown?.(this);
            api.UI.elements.buttons.SIZEHBUTTON?.mouseMove?.(this);
            api.UI.elements.buttons.SIZEHBUTTON?.mouseUp?.(this);
            api.UI.elements.boundingBox?.node?.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.buttons.sizeHButton = sizeHButton;
})();
