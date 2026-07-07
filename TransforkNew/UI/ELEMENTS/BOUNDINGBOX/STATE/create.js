window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.STATE = window.TransforkNew.UI.elements.BOUNDINGBOX.STATE || {};

(function () {
    "use strict";

    function create(existing = {}) {
        return Object.assign(existing, {
            visible: false,
            node: existing.node || null,
            target: null,
            drawable: null,
            bounds: null,
            screenRect: null,
            baseLeft: 0,
            baseTop: 0,
            previewLeft: 0,
            previewTop: 0,
            width: 0,
            height: 0
        });
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.STATE.create = create;
})();
