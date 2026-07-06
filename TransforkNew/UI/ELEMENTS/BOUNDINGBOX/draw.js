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
            left: "0px",
            top: "0px",
            width: "0px",
            height: "0px",
            border: "2px solid #00A2FF",
            boxSizing: "border-box",
            display: "none",
            pointerEvents: "none",
            zIndex: "9999"
        });
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.draw = draw;
})();
