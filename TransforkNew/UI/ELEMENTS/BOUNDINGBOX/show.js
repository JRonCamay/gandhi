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
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.show.js.show", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/show.js", functionName: "show", purpose: "local process member registration for show", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function show(box) {
        return window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.show?.(box) || null;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.show = show;
})();
