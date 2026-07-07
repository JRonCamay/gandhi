window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    function drawVersionLabel(box) {
        if (!box?.node) return null;
        let label = box.node.querySelector("#transfork-new-version-label");
        if (!label) {
            label = document.createElement("div");
            label.id = "transfork-new-version-label";
            box.node.appendChild(label);
        }
        label.textContent = "TransforkNew v" + (window.TransforkNewLoader?.version || window.TransforkNew?.SYSTEM?.version?.value || window.TransforkNew?.VERSION || "dev");
        Object.assign(label.style, {
            position: "absolute",
            left: "50%",
            top: "-24px",
            transform: "translateX(-50%)",
            background: "rgba(0, 162, 255, 0.95)",
            color: "white",
            border: "1px solid white",
            borderRadius: "4px",
            padding: "2px 6px",
            fontSize: "10px",
            fontWeight: "bold",
            lineHeight: "12px",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            boxShadow: "0 2px 6px rgba(0,0,0,0.25)"
        });
        return label;
    }

    function draw(box) {
        window.TransforkNew.UI.elements.BOUNDINGBOX.DRAW?.createNode?.(box);
        drawVersionLabel(box);
        return box?.node || null;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.drawVersionLabel = drawVersionLabel;
    window.TransforkNew.UI.elements.BOUNDINGBOX.draw = draw;
})();
