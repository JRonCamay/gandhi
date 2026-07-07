window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/capture.js";
    const STATION = 2;
    const PURPOSE = "move drag captures current mouse position";
    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.capture", file: FILE, functionName: "capture", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function capture(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "capture")) return DRAG.stop?.("guardian blocked capture");

        try {
            const button = ctx.button;
            const event = ctx.event;
            if (!button?.dragging) return DRAG.stop?.("button not dragging");
            event.preventDefault();
            event.stopPropagation();
            button.latestMouseX = event.clientX;
            button.latestMouseY = event.clientY;
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "capture", STATION);
            return DRAG.stop?.("capture crashed", { error });
        }
    }

    DRAG.capture = capture;
    DRAG.registerStation?.(STATION, capture, { file: FILE, functionName: "capture" });
})();
