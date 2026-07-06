window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    function show(box) {
        if (!box?.node) return null;
        box.node.style.display = "block";
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.show = show;
})();
