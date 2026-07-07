window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/end.js";
    const STATION = 7;
    const PURPOSE = "move drag ends preview session";

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.end", file: FILE, functionName: "end", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function end(button, event) {
        if (!window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.guard?.(STATION, FILE, "end")) return false;

        try {
            if (!button?.dragging) return false;
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(3);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.run?.(button);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(7);
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (box) {
                box.baseLeft = box.previewLeft;
                box.baseTop = box.previewTop;
            }
            button.startButtonLeft = button.previewButtonLeft;
            button.startButtonTop = button.previewButtonTop;
            button.dragging = false;
            button.frameRequested = false;
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(0);
            return true;
        } catch (error) {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.sleeper?.(error, FILE, "end", STATION);
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(0);
            return false;
        }
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.end = end;
})();
