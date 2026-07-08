window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY = window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.VISIBILITY.show.js.show", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/VISIBILITY/show.js", functionName: "show", purpose: "local process member registration for show", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function show(box) {
        if (!box?.node) return null;
        box.node.style.display = "block";
        box.visible = true;
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY.show = show;
})();
