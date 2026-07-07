window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/previewBox.js";
    const STATION = 6;
    const PURPOSE = "move drag previews bounding box position";

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.previewBox", file: FILE, functionName: "previewBox", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function previewBox(button) {
        if (!window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.guard?.(STATION, FILE, "previewBox")) return null;

        try {
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (!button || !box) return null;
            return window.TransforkNew.UI.elements.BOUNDINGBOX.PREVIEW?.applyDelta?.(box, button.dragDx, button.dragDy);
        } catch (error) {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.sleeper?.(error, FILE, "previewBox", STATION);
            return null;
        }
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewBox = previewBox;
})();
