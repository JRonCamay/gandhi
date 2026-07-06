window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

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
