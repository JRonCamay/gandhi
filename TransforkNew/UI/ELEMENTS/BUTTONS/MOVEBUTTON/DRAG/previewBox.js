window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/previewBox.js";
    const STATION = 5;
    const PURPOSE = "move drag previews bounding box position";
    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.previewBox", file: FILE, functionName: "previewBox", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function previewBox(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "previewBox")) return DRAG.stop?.("guardian blocked previewBox");

        try {
            const button = ctx.button;
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (!button || !box) return DRAG.stop?.("button or box missing");
            window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW?.applyDelta?.(box, button.dragDx, button.dragDy);
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "previewBox", STATION);
            return DRAG.stop?.("previewBox crashed", { error });
        }
    }

    DRAG.previewBox = previewBox;
    DRAG.registerStation?.(STATION, previewBox, { file: FILE, functionName: "previewBox" });
})();
