window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH || {};

(function () {
    "use strict";

    function apply(box) {
        if (!box?.screenRect) return null;
        window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW?.applyRect?.(box, box.screenRect);
        window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.show?.(box);
        window.TransforkNew.UI.elements.buttons?.MOVEBUTTON?.DRAW?.attachToBox?.(window.TransforkNew.UI.elements.buttons?.moveButton, box);
        return box.screenRect;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH.apply = apply;
})();
