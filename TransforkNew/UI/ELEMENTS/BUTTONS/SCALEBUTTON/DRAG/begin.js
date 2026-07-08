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
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.DRAG.begin.js.begin", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/begin.js", functionName: "begin", purpose: "local process member registration for begin", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/begin.js";
    const STATION = 1;
    const PURPOSE = "scale drag begins uniform box preview session";
    const DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "SCALE_DRAG.begin", file: FILE, functionName: "begin", purpose: PURPOSE, manager: "SCALE_DRAG", station: STATION });

    function begin(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "begin")) return DRAG.stop?.("guardian blocked begin");

        try {
            const button = ctx.button;
            const event = ctx.event;
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (!button?.node || !box?.node || !box.visible) return DRAG.stop?.("button or box not ready");
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
            button.scaleRatio = 1;
            button.frameRequested = false;
            box.baseLeft = boxRect.left;
            box.baseTop = boxRect.top;
            box.previewLeft = boxRect.left;
            box.previewTop = boxRect.top;
            box.baseWidth = boxRect.width;
            box.baseHeight = boxRect.height;
            box.previewWidth = boxRect.width;
            box.previewHeight = boxRect.height;
            box.width = boxRect.width;
            box.height = boxRect.height;
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "begin", STATION);
            return DRAG.stop?.("begin crashed", { error });
        }
    }

    DRAG.begin = begin;
    DRAG.registerStation?.(STATION, begin, { file: FILE, functionName: "begin" });
})();
