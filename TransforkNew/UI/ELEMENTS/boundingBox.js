window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const boundingBox = {
        node: null,

        init() {
            if (this.node) return this.node;
            this.node = document.createElement("div");
            this.node.id = "transfork-new-bounding-box";
            api.UI.elements.BOUNDINGBOX?.draw?.(this);
            document.body.appendChild(this.node);
            return this.node;
        }
    };

    api.UI.elements.boundingBox = boundingBox;
})();
