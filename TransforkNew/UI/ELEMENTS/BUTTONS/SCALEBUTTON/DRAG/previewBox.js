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
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.DRAG.previewBox.js.previewBox", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/previewBox.js", functionName: "previewBox", purpose: "local process member registration for previewBox", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/previewBox.js";
    const STATION = 4;
    const PURPOSE = "scale drag previews uniform bounding box size";
    const DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "SCALE_DRAG.previewBox", file: FILE, functionName: "previewBox", purpose: PURPOSE, manager: "SCALE_DRAG", station: STATION });

    function previewBox(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "previewBox")) return DRAG.stop?.("guardian blocked previewBox");

        try {
            const button = ctx.button;
            const box = window.TransforkNew.UI?.elements?.boundingBox;
            if (!button || !box?.node) return DRAG.stop?.("button or box missing");
            const ratio = button.scaleRatio || 1;
            const width = Math.max(8, (box.baseWidth || box.width || 8) * ratio);
            const height = Math.max(8, (box.baseHeight || box.height || 8) * ratio);
            box.previewWidth = width;
            box.previewHeight = height;
            box.width = width;
            box.height = height;
            box.node.style.width = width + "px";
            box.node.style.height = height + "px";
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "previewBox", STATION);
            return DRAG.stop?.("previewBox crashed", { error });
        }
    }

    DRAG.previewBox = previewBox;
    DRAG.registerStation?.(STATION, previewBox, { file: FILE, functionName: "previewBox" });
})();
