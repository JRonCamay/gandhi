window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const flipVButton = {
        node: null,

        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-flip-v-button";
            api.UI.elements.buttons.FLIPVBUTTON?.draw?.(this);
            api.UI.elements.buttons.FLIPVBUTTON?.click?.(this);
            api.UI.elements.boundingBox?.node?.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.buttons.flipVButton = flipVButton;
})();
