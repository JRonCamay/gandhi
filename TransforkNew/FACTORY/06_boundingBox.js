window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function boundingBox(state = {}) {
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        box?.init?.();
        window.TransforkNew.UI?.elements?.BOUNDINGBOX?.refresh?.(box);
        state.box = box || null;
        return state;
    }

    window.TransforkNew.FACTORY.boundingBox = boundingBox;
})();
