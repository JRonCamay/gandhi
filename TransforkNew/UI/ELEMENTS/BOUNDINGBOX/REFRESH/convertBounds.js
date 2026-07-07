window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH || {};

(function () {
    "use strict";

    function convertBounds(box) {
        const vm = window.TransforkNew.SYSTEM?.vm?.get?.();
        const canvas = window.TransforkNew.SYSTEM?.VM?.getCanvas?.();
        if (!box?.bounds || !vm || !canvas) return null;
        box.screenRect = window.TransforkNew.UTILS?.COORDS?.boundsToScreenRect?.(box.bounds, canvas, vm) || null;
        return box.screenRect;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.convertBounds = convertBounds;
})();
