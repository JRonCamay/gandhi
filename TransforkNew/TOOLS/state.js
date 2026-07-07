window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MAR = window.TransforkNew.MAR || {};
window.TransforkNew.TOOLS = window.TransforkNew.TOOLS || {};

(function () {
    "use strict";

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
