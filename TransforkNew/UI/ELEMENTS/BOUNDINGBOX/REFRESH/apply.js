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
            { id: "RENDER.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.REFRESH.apply.js.apply", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/REFRESH/apply.js", functionName: "apply", purpose: "local process member registration for apply", manager: "RENDER", station: 0 }
        ].forEach(register);
    })();

    function apply(box) {
        if (!box?.screenRect) return null;
        window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW?.applyRect?.(box, box.screenRect);
        window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.show?.(box);
        window.TransforkNew.UI.elements.buttons?.MOVEBUTTON?.DRAW?.attachToBox?.(window.TransforkNew.UI.elements.buttons?.moveButton, box);
        return box.screenRect;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.apply = apply;
})();
