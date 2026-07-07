window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.ROTATEBUTTON = window.TransforkNew.UI.elements.buttons.ROTATEBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "⟳";
        button.node.title = "Rotate";
        Object.assign(button.node.style, {
            position: "absolute",
            left: "50%",
            top: "-38px",
            width: "28px",
            height: "28px",
            marginLeft: "-14px",
            borderRadius: "50%",
            border: "2px solid #2f80ff",
            background: "#ffffff",
            color: "#2f80ff",
            font: "bold 18px Arial, sans-serif",
            lineHeight: "24px",
            textAlign: "center",
            pointerEvents: "auto",
            cursor: "grab",
            userSelect: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,.22)"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.ROTATEBUTTON.draw = draw;
})();
