window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.hide.js.hide", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/hide.js", functionName: "hide", purpose: "local process member registration for hide", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function hide(box) {
        return window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box) || null;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.hide = hide;
})();
