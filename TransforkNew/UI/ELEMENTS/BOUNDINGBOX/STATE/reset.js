window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.STATE = window.TransforkNew.UI.elements.BOUNDINGBOX.STATE || {};

(function () {
    "use strict";

    function reset(box) {
        if (!box) return null;
        const node = box.node || null;
        window.TransforkNew.UI.elements.BOUNDINGBOX.STATE.create(box);
        box.node = node;
        return box;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.STATE.reset = reset;
})();
