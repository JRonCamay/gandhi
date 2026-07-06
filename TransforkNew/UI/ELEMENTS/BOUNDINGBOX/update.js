window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    function update(box, rect) {
        if (!box?.node || !rect) return null;
        box.node.style.left = rect.left + "px";
        box.node.style.top = rect.top + "px";
        box.node.style.width = rect.width + "px";
        box.node.style.height = rect.height + "px";
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.update = update;
})();
