window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.simulate.js.simulate", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/simulate.js", functionName: "simulate", purpose: "local process member registration for simulate", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/simulate.js";
    const STATION = 3;
    const PURPOSE = "move drag calculates preview delta";
    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.simulate", file: FILE, functionName: "simulate", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function simulate(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "simulate")) return DRAG.stop?.("guardian blocked simulate");

        try {
            const button = ctx.button;
            if (!button?.dragging) return DRAG.stop?.("button not dragging");
            button.dragDx = button.latestMouseX - button.startMouseX;
            button.dragDy = button.latestMouseY - button.startMouseY;
            ctx.simulation = { dx: button.dragDx, dy: button.dragDy };
            return DRAG.done?.({ station: STATION, simulation: ctx.simulation });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "simulate", STATION);
            return DRAG.stop?.("simulate crashed", { error });
        }
    }

    DRAG.simulate = simulate;
    DRAG.registerStation?.(STATION, simulate, { file: FILE, functionName: "simulate" });
})();
