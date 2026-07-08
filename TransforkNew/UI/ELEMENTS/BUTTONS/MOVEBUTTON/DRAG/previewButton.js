window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.buttons = window.TransforkNew.UI.elements.buttons || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON = window.TransforkNew.UI.elements.buttons.MOVEBUTTON || {};
window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.previewButton.js.previewButton", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/previewButton.js", functionName: "previewButton", purpose: "local process member registration for previewButton", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/previewButton.js";
    const STATION = 4;
    const PURPOSE = "move drag previews button position";
    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.previewButton", file: FILE, functionName: "previewButton", purpose: PURPOSE, manager: "MOVE_DRAG", station: STATION });

    function previewButton(ctx) {
        if (!DRAG.guard?.(STATION, FILE, "previewButton")) return DRAG.stop?.("guardian blocked previewButton");

        try {
            const button = ctx.button;
            if (!button) return DRAG.stop?.("button missing");
            const left = button.startButtonLeft + button.dragDx;
            const top = button.startButtonTop + button.dragDy;
            window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAW?.applyPosition?.(button, left, top);
            return DRAG.done?.({ station: STATION });
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "previewButton", STATION);
            return DRAG.stop?.("previewButton crashed", { error });
        }
    }

    DRAG.previewButton = previewButton;
    DRAG.registerStation?.(STATION, previewButton, { file: FILE, functionName: "previewButton" });
})();
