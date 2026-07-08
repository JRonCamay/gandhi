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
            { id: "MOVE.local.TransforkNew.UI.ELEMENTS.BUTTONS.MOVEBUTTON.DRAG.run.js.run", file: "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/run.js", functionName: "run", purpose: "local process member registration for run", manager: "MOVE", station: 0 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/run.js";
    const PURPOSE = "move drag starts manager-owned preview frame";
    const DRAG = window.TransforkNew.UI.elements.buttons.MOVEBUTTON.DRAG;

    window.TransforkNew.SYSTEM?.REGISTRY?.register?.({ id: "MOVE_DRAG.run", file: FILE, functionName: "run", purpose: PURPOSE, manager: "MOVE_DRAG", station: 0 });

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
