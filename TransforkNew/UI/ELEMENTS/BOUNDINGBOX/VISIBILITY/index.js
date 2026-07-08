    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BOUNDINGBOX.VISIBILITY.index.js.module", file: "TransforkNew/UI/ELEMENTS/BOUNDINGBOX/VISIBILITY/index.js", functionName: "module", purpose: "local process member registration for module", manager: "UI", station: 0 }
        ].forEach(register);
    })();
window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};
window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY = window.TransforkNew.UI.elements.BOUNDINGBOX.VISIBILITY || {};
