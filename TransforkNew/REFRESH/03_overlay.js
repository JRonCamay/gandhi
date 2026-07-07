window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    function overlay() {
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        if (!box?.node) return;
        box.node.style.display = box.node.style.display || "block";
    }

    window.TransforkNew.REFRESH.overlay = overlay;
})();
