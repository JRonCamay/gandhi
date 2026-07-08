window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.STATE = window.TransforkNew.UI.elements.BOUNDINGBOX.STATE || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.STATE.reset.js.module", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/STATE/reset.js", functionName: "module", purpose: "local process member registration for module", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function reset(box) {
        if (!box) return null;
        const node = box.node || null;
        window.TransforkNew.UI.elements.BOUNDINGBOX.STATE.create(box);
        box.node = node;
        return box;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.STATE.reset = reset;
})();
