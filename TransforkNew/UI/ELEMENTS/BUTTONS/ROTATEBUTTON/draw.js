window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.ROTATEBUTTON = window.TransforkNew.UI.elements.buttons.ROTATEBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "↻";
        Object.assign(button.node.style, {
            position: "absolute",
            left: "50%",
            top: "-44px",
            width: "20px",
            height: "20px",
            marginLeft: "-10px",
            borderRadius: "50%",
            background: "#ff9800",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "grab",
            pointerEvents: "auto",
            fontSize: "14px",
            fontWeight: "bold"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.ROTATEBUTTON.draw = draw;
})();
