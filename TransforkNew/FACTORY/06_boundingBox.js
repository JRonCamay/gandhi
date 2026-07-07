window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    function boundingBox(state = {}) {
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station boundingBox before", {
            box,
            hasInit: typeof box?.init === "function",
            refreshApi: window.TransforkNew.UI?.elements?.BOUNDINGBOX
        });
        box?.init?.();
        const result = window.TransforkNew.UI?.elements?.BOUNDINGBOX?.refresh?.(box);
        state.box = box || null;
        state.boxRefreshResult = result || null;
        window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station boundingBox after", {
            box: state.box,
            result,
            visible: box?.visible,
            display: box?.node?.style?.display
        });
        return state;
    }

    window.TransforkNew.FACTORY.boundingBox = boundingBox;
})();
