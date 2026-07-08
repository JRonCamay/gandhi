window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.CLEARBUTTON = window.TransforkNew.UI.elements.buttons.CLEARBUTTON || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "UI.local.TransforkNew.UI.ELEMENTS.BUTTONS.CLEARBUTTON.draw.js.draw", file: "TransforkNew/UI/ELEMENTS/BUTTONS/CLEARBUTTON/draw.js", functionName: "draw", purpose: "local process member registration for draw", manager: "UI", station: 0 }
        ].forEach(register);
    })();

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "⟲";
        Object.assign(button.node.style, {
            position: "absolute",
            left: "-26px",
            top: "48px",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            border: "1px solid white",
            background: "#c0392b",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            pointerEvents: "auto",
            fontSize: "14px",
            fontWeight: "bold"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.CLEARBUTTON.draw = draw;
})();
