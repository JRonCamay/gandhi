window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

    const api = window.TransforkNew;
    const transparencyButton = {
        node: null,
        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-transparency-button";
            api.UI.elements.buttons.TRANSPARENCYBUTTON?.draw?.(this);
            api.UI.elements.boundingBox?.node?.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.buttons.transparencyButton = transparencyButton;
})();
