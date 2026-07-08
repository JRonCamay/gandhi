window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW = window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.PREVIEW.applyPosition.js.applyPosition", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/PREVIEW/applyPosition.js", functionName: "applyPosition", purpose: "local process member registration for applyPosition", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function applyPosition(box, left, top) {
        if (!box?.node) return null;
        box.previewLeft = left;
        box.previewTop = top;
        box.node.style.left = left + "px";
        box.node.style.top = top + "px";
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW.applyPosition = applyPosition;
})();
