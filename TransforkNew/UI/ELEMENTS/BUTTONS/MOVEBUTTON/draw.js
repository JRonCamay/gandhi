window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "✥";
        Object.assign(button.node.style, {
            position: "absolute",
            left: "50%",
            top: "-23px",
            width: "20px",
            height: "20px",
            marginLeft: "-10px",
            borderRadius: "4px",
            border: "1px solid white",
            background: "#e53935",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "move",
            pointerEvents: "auto",
            fontSize: "16px",
            fontWeight: "bold"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.draw = draw;
})();
