window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.TRANSPARENCYBUTTON = window.TransforkNew.UI.elements.buttons.TRANSPARENCYBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button || !button.node) return null;
        button.node.textContent = "A";
        Object.assign(button.node.style, {
            position: "absolute",
            left: "50%",
            top: "-70px",
            width: "24px",
            height: "20px",
            marginLeft: "-12px",
            borderRadius: "4px",
            background: "#34495e",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "ew-resize",
            pointerEvents: "auto",
            fontSize: "11px"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.TRANSPARENCYBUTTON.draw = draw;
})();
