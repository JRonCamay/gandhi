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
            { id: "RENDER.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.REFRESH.readBounds.js.readBounds", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/REFRESH/readBounds.js", functionName: "readBounds", purpose: "local process member registration for readBounds", manager: "RENDER", station: 0 }
        ].forEach(register);
    })();

    function readBounds(box) {
        if (!box?.drawable || typeof box.drawable.getAABB !== "function") return null;
        box.bounds = box.drawable.getAABB();
        return box.bounds;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.readBounds = readBounds;
})();
