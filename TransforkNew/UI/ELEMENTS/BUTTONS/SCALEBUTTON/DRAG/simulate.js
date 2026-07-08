window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.SCALEBUTTON = window.TransforkNew.UI.elements.buttons.SCALEBUTTON || {};
window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.DRAG.simulate.js.simulate", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/simulate.js", functionName: "simulate", purpose: "local process member registration for simulate", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/simulate.js";
    const STATION = 3;
    const PURPOSE = "scale drag calculates uniform scale preview ratio";
    const DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "SCALE_DRAG.simulate", file: FILE, functionName: "simulate", purpose: PURPOSE, manager: "SCALE_DRAG", station: STATION });

    function simulate(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "simulate")) return DRAG.stop?.("guardian blocked simulate");

        try {
            const button = ctx.button;
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (!button?.dragging || !box) return DRAG.stop?.("button or box not ready");
            button.dragDx = button.latestMouseX - button.startMouseX;
            button.dragDy = button.latestMouseY - button.startMouseY;
            const baseSize = Math.max(1, Math.max(box.baseWidth || box.width || 1, box.baseHeight || box.height || 1));
            const dominantDelta = Math.abs(button.dragDx) >= Math.abs(button.dragDy) ? button.dragDx : button.dragDy;
            button.scaleRatio = Math.max(0.1, 1 + (dominantDelta / baseSize));
            ctx.simulation = { dx: button.dragDx, dy: button.dragDy, ratio: button.scaleRatio };
            return DRAG.done?.({ station: STATION, simulation: ctx.simulation });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "simulate", STATION);
            return DRAG.stop?.("simulate crashed", { error });
        }
    }

    DRAG.simulate = simulate;
    DRAG.registerStation?.(STATION, simulate, { file: FILE, functionName: "simulate" });
})();
