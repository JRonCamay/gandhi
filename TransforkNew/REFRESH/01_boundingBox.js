window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    function boundingBox(state = {}) {
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        if (!box) return;

        window.TransforkNew.UI?.elements?.BOUNDINGBOX?.refresh?.(box);
        window.TransforkNew.REFRESH.state.lastRefresh = state;
    }

    window.TransforkNew.REFRESH.boundingBox = boundingBox;
})();
