window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.TRANSPARENCYBUTTON = window.TransforkNew.UI.elements.buttons.TRANSPARENCYBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "◐ 100";
        button.node.title = "Alpha";
        Object.assign(button.node.style, {
            position: "absolute",
            left: "50%",
            top: "-70px",
            width: "36px",
            height: "18px",
            marginLeft: "-20px",
            borderRadius: "4px",
            border: "1px solid #5d7a94",
            background: "#34495e",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "ew-resize",
            pointerEvents: "auto",
            fontSize: "10px",
            fontWeight: "bold",
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.TRANSPARENCYBUTTON.draw = draw;
})();
