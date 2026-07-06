window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.FLIPVBUTTON = window.TransforkNew.UI.elements.buttons.FLIPVBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "⇅";
        Object.assign(button.node.style, {
            position: "absolute",
            left: "-26px",
            top: "24px",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            background: "#16a085",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            pointerEvents: "auto",
            fontSize: "14px"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.FLIPVBUTTON.draw = draw;
})();
