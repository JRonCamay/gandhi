window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "RENDER.local.TransforkNew.REFRESH.03.overlay.js.overlay", file: "TransforkNew/REFRESH/03_overlay.js", functionName: "overlay", purpose: "local process member registration for overlay", manager: "RENDER", station: 3 }
        ].forEach(register);
    })();

    function overlay() {
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        if (!box?.node) return;
        box.node.style.display = box.node.style.display || "block";
    }

    window.TransforkNew.REFRESH.overlay = overlay;
})();
