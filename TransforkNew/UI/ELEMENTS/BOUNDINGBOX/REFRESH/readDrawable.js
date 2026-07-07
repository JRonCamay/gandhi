window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH || {};

(function () {
    "use strict";

    function readDrawable(box) {
        if (!box?.target) return null;
        box.drawable = window.TransforkNew.SYSTEM?.VM?.getDrawable?.(box.target) || null;
        return box.drawable;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.readDrawable = readDrawable;
})();
