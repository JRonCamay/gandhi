window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/simulate.js";
    const STATION = 4;
    const PURPOSE = "move drag calculates preview delta";

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.simulate", file: FILE, functionName: "simulate", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function simulate(button) {
        if (!window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.guard?.(STATION, FILE, "simulate")) return null;

        try {
            if (!button?.dragging) return null;
            button.dragDx = button.latestMouseX - button.startMouseX;
            button.dragDy = button.latestMouseY - button.startMouseY;
            return { dx: button.dragDx, dy: button.dragDy };
        } catch (error) {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.sleeper?.(error, FILE, "simulate", STATION);
            return null;
        }
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.simulate = simulate;
})();
