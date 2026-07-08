window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.boundingBox.js.init", file: "TransforkNew/UI/ELEMENTS/boundingBox.js", functionName: "init", purpose: "local process member registration for init", manager: "UI", station: 0 }
        ].forEach(register);
    })();

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
