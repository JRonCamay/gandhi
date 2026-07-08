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
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.VISIBILITY.hide.js.hide", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/VISIBILITY/hide.js", functionName: "hide", purpose: "local process member registration for hide", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function hide(box) {
        if (!box?.node) return null;
        box.node.style.display = "none";
        box.visible = false;
        window.TransforkNew.UI.elements.buttons?.MOVEBUTTON?.STATE?.reset?.(window.TransforkNew.UI.elements.buttons?.moveButton);
        return box.node;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY.hide = hide;
})();
