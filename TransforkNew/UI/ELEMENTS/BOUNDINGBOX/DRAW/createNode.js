window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW = window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW || {};

(function () {
    "use strict";

    function createNode(box) {
        if (!box) return null;
        if (box.node) return box.node;
        const node = document.createElement("div");
        node.id = "transfork-new-bounding-box";
        Object.assign(node.style, {
            position: "fixed",
            border: "2px solid #00A2FF",
            pointerEvents: "none",
            zIndex: "9999",
            boxSizing: "border-box",
            display: "none",
            userSelect: "none"
        });
        document.body.appendChild(node);
        box.node = node;
        return node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW.createNode = createNode;
})();
