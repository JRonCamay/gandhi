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
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.DRAG.previewButton.js.previewButton", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/previewButton.js", functionName: "previewButton", purpose: "local process member registration for previewButton", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/previewButton.js";
    const STATION = 5;
    const PURPOSE = "scale drag previews scale button position";
    const DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "SCALE_DRAG.previewButton", file: FILE, functionName: "previewButton", purpose: PURPOSE, manager: "SCALE_DRAG", station: STATION });

    function previewButton(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "previewButton")) return DRAG.stop?.("guardian blocked previewButton");

        try {
            const button = ctx.button;
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (!button?.node || !box?.node) return DRAG.stop?.("button or box missing");
            button.previewButtonLeft = box.previewWidth || box.width || 0;
            button.previewButtonTop = box.previewHeight || box.height || 0;
            button.node.style.left = "auto";
            button.node.style.top = "auto";
            button.node.style.right = "-27px";
            button.node.style.bottom = "-6px";
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "previewButton", STATION);
            return DRAG.stop?.("previewButton crashed", { error });
        }
    }

    DRAG.previewButton = previewButton;
    DRAG.registerStation?.(STATION, previewButton, { file: FILE, functionName: "previewButton" });
})();
