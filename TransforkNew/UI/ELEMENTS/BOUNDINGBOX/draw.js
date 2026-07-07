window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    function draw(box) {
        if (!box?.node) return null;

        Object.assign(box.node.style, {
            position: "fixed",
            border: "2px solid #00A2FF",
            pointerEvents: "none",
            zIndex: "9999",
            boxSizing: "border-box",
            display: "none",
            userSelect: "none",
            cursor: "move"
        });

        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.draw = draw;
})();
