window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "RENDER.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.REFRESH.readDrawable.js.readDrawable", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/REFRESH/readDrawable.js", functionName: "readDrawable", purpose: "local process member registration for readDrawable", manager: "RENDER", station: 0 }
        ].forEach(register);
    })();

    function readDrawable(box) {
        if (!box?.target) return null;
        box.drawable = window.TransforkNew.SYSTEM?.VM?.getDrawable?.(box.target) || null;
        return box.drawable;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.readDrawable = readDrawable;
})();
