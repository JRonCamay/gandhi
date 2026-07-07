window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    const boundingBox = api.UI.elements.BOUNDINGBOX?.STATE?.create?.({}) || {
        visible: false,
        node: null,
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
    };

    boundingBox.init = function init() {
        api.UI.elements.BOUNDINGBOX?.DRAW?.createNode?.(this);
        api.UI.elements.BOUNDINGBOX?.drawVersionLabel?.(this);
        return this.node;
    };

    api.UI.elements.boundingBox = boundingBox;
})();
