window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.draw.js.draw", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/draw.js", functionName: "draw", purpose: "local process member registration for draw", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    function draw(button) {
        return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW?.createNode?.(button) || null;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.draw = draw;
})();
