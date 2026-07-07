window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH || {};

(function () {
    "use strict";

    function readTarget(box) {
        if (!box) return null;
        const target = window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null;
        box.target = target && !target.isStage ? target : null;
        return box.target;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.readTarget = readTarget;
})();
