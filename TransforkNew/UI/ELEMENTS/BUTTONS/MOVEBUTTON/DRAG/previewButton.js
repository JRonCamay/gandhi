window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/previewButton.js";
    const STATION = 5;
    const PURPOSE = "move drag previews button position";

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.previewButton", file: FILE, functionName: "previewButton", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function previewButton(button) {
        if (!window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.guard?.(STATION, FILE, "previewButton")) return null;

        try {
            if (!button) return null;
            const left = button.startButtonLeft + button.dragDx;
            const top = button.startButtonTop + button.dragDy;
            return window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW?.applyPosition?.(button, left, top);
        } catch (error) {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.sleeper?.(error, FILE, "previewButton", STATION);
            return null;
        }
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.previewButton = previewButton;
})();
