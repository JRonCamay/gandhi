window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    function hide(box) {
        if (!box?.node) return null;
        box.node.style.display = "none";
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.hide = hide;
})();
