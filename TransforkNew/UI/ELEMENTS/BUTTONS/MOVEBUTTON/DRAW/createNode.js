window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW || {};

(function () {
    "use strict";

    function createNode(button) {
        if (!button) return null;
        if (button.node) return button.node;
        const node = document.createElement("div");
        node.id = "transfork-new-move-button";
        node.textContent = "✥";
        Object.assign(node.style, {
            position: "fixed",
            left: "0px",
            top: "0px",
            width: "20px",
            height: "20px",
            borderRadius: "4px",
            border: "1px solid white",
            background: "#e53935",
            color: "white",
            display: "none",
            alignItems: "center",
            justifyContent: "center",
            cursor: "move",
            pointerEvents: "auto",
            fontSize: "16px",
            fontWeight: "bold",
            lineHeight: "20px",
            textAlign: "center",
            zIndex: "10000",
            userSelect: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
        });
        document.body.appendChild(node);
        button.node = node;
        return node;
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW.createNode = createNode;
})();
