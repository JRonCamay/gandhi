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
            { id: "SCALE.local.TransforkNew.UI.ELEMENTS.BUTTONS.SCALEBUTTON.DRAG.run.js.run", file: "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/run.js", functionName: "run", purpose: "local process member registration for run", manager: "SCALE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/run.js";
    const PURPOSE = "scale drag starts manager-owned preview frame";
    const DRAG = window.TransforkNew.UI.elements.buttons.SCALEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "SCALE_DRAG.run", file: FILE, functionName: "run", purpose: PURPOSE, manager: "SCALE_DRAG", station: 0 });

    function run(button) {
        try {
            return DRAG.start?.({ button }, 3, 5);
        } catch (error) {
            DRAG.sleeper?.(error, FILE, "run", 0);
            return DRAG.stop?.("run crashed", { error });
        }
    }

    DRAG.run = run;
})();
