window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;
    const guideLines = [];

    function clear260705_SG4D8Q() {
        guideLines.forEach(line => line.remove());
        guideLines.length = 0;
    }

    function isSnapBox260705_SG8K2M(node) {
        if (!(node instanceof HTMLElement)) return false;
        const style = getComputedStyle(node);
        return style.borderStyle.includes("dashed") &&
            style.borderColor.includes("245") &&
            style.pointerEvents === "none";
    }

    function activeSnapBoxes260705_SG5C9P() {
        return Array.from(document.body.children).filter(isSnapBox260705_SG8K2M);
    }

    function addLine260705_SG2V7N(kind, value, stageRect) {
        const line = document.createElement("div");

        if (kind === "x") {
            Object.assign(line.style, {
                position: "fixed",
                left: value + "px",
                top: stageRect.top + "px",
                width: "0px",
                height: stageRect.height + "px",
                borderLeft: "2px dotted #9ca3af"
            });
        }
        else {
            Object.assign(line.style, {
                position: "fixed",
                left: stageRect.left + "px",
                top: value + "px",
                width: stageRect.width + "px",
                height: "0px",
                borderTop: "2px dotted #9ca3af"
            });
        }

        Object.assign(line.style, {
            pointerEvents: "none",
            zIndex: "9996",
            userSelect: "none",
            boxSizing: "border-box"
        });

        document.body.appendChild(line);
        guideLines.push(line);
    }

    function update260705_SG9M3R() {
        const boxes = activeSnapBoxes260705_SG5C9P();
        clear260705_SG4D8Q();

        if (!boxes.length) return;

        const canvas = api.coords?.getStageCanvas?.() || document.querySelector("canvas");
        if (!canvas) return;

        const stageRect = canvas.getBoundingClientRect();
        const seen = new Set();

        boxes.forEach(box => {
            const rect = box.getBoundingClientRect();
            [rect.left, rect.right].forEach(x => {
                const key = "x:" + Math.round(x);
                if (seen.has(key)) return;
                seen.add(key);
                addLine260705_SG2V7N("x", x, stageRect);
            });
            [rect.top, rect.bottom].forEach(y => {
                const key = "y:" + Math.round(y);
                if (seen.has(key)) return;
                seen.add(key);
                addLine260705_SG2V7N("y", y, stageRect);
            });
        });
    }

    function loop260705_SG7F6L() {
        update260705_SG9M3R();
        requestAnimationFrame(loop260705_SG7F6L);
    }

    loop260705_SG7F6L();

    api.registerModule260705_NS8Q2M("snapGuideOverlay", {
        update: update260705_SG9M3R,
        clear: clear260705_SG4D8Q
    });
})();
