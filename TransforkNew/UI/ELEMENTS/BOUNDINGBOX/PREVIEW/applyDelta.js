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
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.PREVIEW.applyDelta.js.applyDelta", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/PREVIEW/applyDelta.js", functionName: "applyDelta", purpose: "local process member registration for applyDelta", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function applyDelta(box, dx, dy) {
        if (!box) return null;
        return window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW.applyPosition?.(box, box.baseLeft + dx, box.baseTop + dy);
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW.applyDelta = applyDelta;
})();
