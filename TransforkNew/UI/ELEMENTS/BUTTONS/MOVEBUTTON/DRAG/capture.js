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

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.capture", file: FILE, functionName: "capture", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function capture(button, event) {
        if (!window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.guard?.(STATION, FILE, "capture")) return false;

        try {
            if (!button?.dragging) return false;
            event.preventDefault();
            event.stopPropagation();
            button.latestMouseX = event.clientX;
            button.latestMouseY = event.clientY;
            if (!button.frameRequested) {
                button.frameRequested = true;
                requestAnimationFrame(() => {
                    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.setStation?.(3);
                    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.run?.(button);
                });
            }
            return true;
        } catch (error) {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.sleeper?.(error, FILE, "capture", STATION);
            return false;
        }
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.capture = capture;
})();
