window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MAR = window.TransforkNew.MAR || {};
window.TransforkNew.TOOLS = window.TransforkNew.TOOLS || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.TOOLS.state.js.module", file: "TransforkNew/TOOLS/state.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const TOOL_NONE = "NONE";
    const TOOL_MOVE = "MOVE";
    const TOOL_ROTATE = "ROTATE";
    const TOOL_SCALE = "SCALE";

    window.TransforkNew.MAR.tool = window.TransforkNew.MAR.tool || TOOL_NONE;

    window.TransforkNew.TOOLS.state = {
        TOOL_NONE,
        TOOL_MOVE,
        TOOL_ROTATE,
        TOOL_SCALE
    };
})();
