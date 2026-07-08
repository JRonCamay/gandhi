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
            { id: "RENDER.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.REFRESH.readTarget.js.readTarget", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/REFRESH/readTarget.js", functionName: "readTarget", purpose: "local process member registration for readTarget", manager: "RENDER", station: 0 }
        ].forEach(register);
    })();

    function readTarget(box) {
        if (!box) return null;
        const target = window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null;
        box.target = target && !target.isStage ? target : null;
        return box.target;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.readTarget = readTarget;
})();
