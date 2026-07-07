window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/begin.js";
    const STATION = 1;
    const PURPOSE = "move drag begin captures initial box and button state";

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.begin", file: FILE, functionName: "begin", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function begin(button, event) {
        if (!window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.guard?.(STATION, FILE, "begin")) return false;

        try {
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (!button?.node || !box?.node || !box.visible) return false;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            const buttonRect = button.node.getBoundingClientRect();
            const boxRect = box.node.getBoundingClientRect();
            button.dragging = true;
            button.startMouseX = event.clientX;
            button.startMouseY = event.clientY;
            button.latestMouseX = event.clientX;
            button.latestMouseY = event.clientY;
            button.startButtonLeft = buttonRect.left;
            button.startButtonTop = buttonRect.top;
            button.previewButtonLeft = buttonRect.left;
            button.previewButtonTop = buttonRect.top;
            button.dragDx = 0;
            button.dragDy = 0;
            button.frameRequested = false;
            box.baseLeft = boxRect.left;
            box.baseTop = boxRect.top;
            box.previewLeft = boxRect.left;
            box.previewTop = boxRect.top;
            box.width = boxRect.width;
            box.height = boxRect.height;
            return true;
        } catch (error) {
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.sleeper?.(error, FILE, "begin", STATION);
            return false;
        }
    }

    window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG.begin = begin;
})();
