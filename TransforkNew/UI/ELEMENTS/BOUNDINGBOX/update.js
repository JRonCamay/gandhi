window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    function update(box, rect) {
        return window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW?.applyRect?.(box, rect) || null;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.update = update;
})();
