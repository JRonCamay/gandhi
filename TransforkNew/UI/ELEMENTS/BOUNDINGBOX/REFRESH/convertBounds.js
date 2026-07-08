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
            { id: "RENDER.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.REFRESH.convertBounds.js.convertBounds", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/REFRESH/convertBounds.js", functionName: "convertBounds", purpose: "local process member registration for convertBounds", manager: "RENDER", station: 0 }
        ].forEach(register);
    })();

    function convertBounds(box) {
        const vm = window.TransforkNew.SYSTEM?.vm?.get?.();
        const canvas = window.TransforkNew.SYSTEM?.VM?.getCanvas?.();
        if (!box?.bounds || !vm || !canvas) return null;
        box.screenRect = window.TransforkNew.UTILS?.COORDS?.boundsToScreenRect?.(box.bounds, canvas, vm) || null;
        return box.screenRect;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.convertBounds = convertBounds;
})();
