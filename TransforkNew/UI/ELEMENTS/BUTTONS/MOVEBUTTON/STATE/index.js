    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.STATE.index.js.module", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/index.js", functionName: "module", purpose: "local process member registration for module", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();
window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.STATE || {};
