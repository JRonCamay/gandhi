window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "RENDER.local.TransforkNew.REFRESH.01.boundingBox.js.boundingBox", file: "TransforkNew/REFRESH/01_boundingBox.js", functionName: "boundingBox", purpose: "local process member registration for boundingBox", manager: "RENDER", station: 1 }
        ].forEach(register);
    })();

    function boundingBox(state = {}) {
        const box = window.TransforkNew.UI?.elements?.boundingBox;
        if (!box) return;

        window.TransforkNew.UI?.elements?.BOUNDINGBOX?.refresh?.(box);
        window.TransforkNew.REFRESH.state.lastRefresh = state;
    }

    window.TransforkNew.REFRESH.boundingBox = boundingBox;
})();
