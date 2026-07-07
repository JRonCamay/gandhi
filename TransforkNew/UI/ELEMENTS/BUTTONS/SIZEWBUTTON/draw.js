window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SIZEWBUTTON = window.TransforkNew.UI.elements.buttons.SIZEWBUTTON || {};

(function () {
    "use strict";

    function draw(button) {
        if (!button?.node) return null;
        button.node.textContent = "↔";
        button.node.title = "Width";
        Object.assign(button.node.style, {
            position: "absolute",
            right: "-27px",
            bottom: "42px",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            border: "1px solid white",
            background: "#00A2FF",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "ew-resize",
            pointerEvents: "auto",
            fontSize: "14px",
            fontWeight: "bold"
        });
        return button.node;
    }

    window.TransforkNew.UI.elements.buttons.SIZEWBUTTON.draw = draw;
})();
