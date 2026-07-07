window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW = window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW || {};

(function () {
    "use strict";

    function applyPosition(box, left, top) {
        if (!box?.node) return null;
        box.previewLeft = left;
        box.previewTop = top;
        box.node.style.left = left + "px";
        box.node.style.top = top + "px";
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW.applyPosition = applyPosition;
})();
