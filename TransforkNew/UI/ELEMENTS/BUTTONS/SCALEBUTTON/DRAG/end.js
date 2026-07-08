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
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.DRAG.end.js.end", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/end.js", functionName: "end", purpose: "local process member registration for end", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/end.js";
    const STATION = 6;
    const PURPOSE = "scale drag ends uniform box preview session";
    const DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "SCALE_DRAG.end", file: FILE, functionName: "end", purpose: PURPOSE, manager: "SCALE_DRAG", station: STATION });

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
                box.baseWidth = box.previewWidth || box.width;
                box.baseHeight = box.previewHeight || box.height;
                box.width = box.baseWidth;
                box.height = box.baseHeight;
            }
            button.startButtonLeft = button.previewButtonLeft;
            button.startButtonTop = button.previewButtonTop;
            button.dragging = false;
            button.frameRequested = false;
            button.dragLoopActive = false;
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "end", STATION);
            return DRAG.stop?.("end crashed", { error });
        }
    }

    DRAG.end = end;
    DRAG.registerStation?.(STATION, end, { file: FILE, functionName: "end" });
})();
