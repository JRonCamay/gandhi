window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.update.js.update", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/update.js", functionName: "update", purpose: "local process member registration for update", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function update(box, rect) {
        return window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW?.applyRect?.(box, rect) || null;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.update = update;
})();
