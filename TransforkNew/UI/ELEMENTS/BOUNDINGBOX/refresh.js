window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    function refresh(box) {
        const refreshApi = window.TransforkNew.UI.elements.BOUNDINGBOX.REFRESH;
        if (!box || !refreshApi?.readTarget?.(box)) {
            window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box);
            return null;
        }
        if (!refreshApi.readDrawable?.(box) || !refreshApi.readBounds?.(box) || !refreshApi.convertBounds?.(box)) {
            window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY?.hide?.(box);
            return null;
        }
        return refreshApi.apply?.(box) || null;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.refresh = refresh;
})();
