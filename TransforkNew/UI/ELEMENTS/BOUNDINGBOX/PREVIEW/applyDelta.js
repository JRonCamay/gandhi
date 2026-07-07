window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW = window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW || {};

(function () {
    "use strict";

    function applyDelta(box, dx, dy) {
        if (!box) return null;
        return window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW.applyPosition?.(box, box.baseLeft + dx, box.baseTop + dy);
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW.applyDelta = applyDelta;
})();
