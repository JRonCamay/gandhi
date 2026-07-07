window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/run.js";
    const STATION = 3;
    const PURPOSE = "move drag runs ordered preview stations";

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.run", file: FILE, functionName: "run", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function run(button) {
        if (!window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.guard?.(STATION, FILE, "run")) return false;

        try {
            if (!button) return false;
            button.frameRequested = false;
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(4);
            const simulation = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.simulate?.(button);
            if (!simulation) {
                window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(0);
                return false;
            }
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(5);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewButton?.(button);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(6);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewBox?.(button);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(0);
            return true;
        } catch (error) {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.sleeper?.(error, FILE, "run", STATION);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(0);
            return false;
        }
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.run = run;
})();
