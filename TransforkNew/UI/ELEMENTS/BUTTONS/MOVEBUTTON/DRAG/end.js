window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/end.js";
    const STATION = 6;
    const PURPOSE = "move drag ends preview session";
    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.end", file: FILE, functionName: "end", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function end(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "end")) return DRAG.stop?.("guardian blocked end");

        try {
            const button = ctx.button;
            const event = ctx.event;
            if (!button?.dragging) return DRAG.stop?.("button not dragging");
            if (event) {
                event.preventDefault();
                event.stopPropagation();
            }
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (box) {
                box.baseLeft = box.previewLeft;
                box.baseTop = box.previewTop;
            }
            button.startButtonLeft = button.previewButtonLeft;
            button.startButtonTop = button.previewButtonTop;
            button.dragging = false;
            button.frameRequested = false;
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "end", STATION);
            return DRAG.stop?.("end crashed", { error });
        }
    }

    DRAG.end = end;
    DRAG.registerStation?.(STATION, end, { file: FILE, functionName: "end" });
})();
