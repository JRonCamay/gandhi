window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH || {};

(function () {
    "use strict";

    function readBounds(box) {
        if (!box?.drawable || typeof box.drawable.getAABB !== "function") return null;
        box.bounds = box.drawable.getAABB();
        return box.bounds;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.readBounds = readBounds;
})();
