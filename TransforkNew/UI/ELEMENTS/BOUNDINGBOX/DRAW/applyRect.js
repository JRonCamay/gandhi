window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW = window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW || {};

(function () {
    "use strict";

    function applyRect(box, rect) {
        if (!box?.node || !rect) return null;
        box.screenRect = rect;
        box.baseLeft = rect.left;
        box.baseTop = rect.top;
        box.previewLeft = rect.left;
        box.previewTop = rect.top;
        box.width = rect.width;
        box.height = rect.height;
        box.node.style.left = rect.left + "px";
        box.node.style.top = rect.top + "px";
        box.node.style.width = rect.width + "px";
        box.node.style.height = rect.height + "px";
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW.applyRect = applyRect;
})();
