window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SCALEBUTTON = window.TransforkNew.UI.elements.buttons.SCALEBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "◲";
        Object.assign(button.node.style, {
            position: "absolute",
            right: "-27px",
            bottom: "-6px",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            background: "#00A2FF",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "nwse-resize",
            pointerEvents: "auto"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SCALEBUTTON.draw = draw;
})();
