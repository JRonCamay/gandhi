window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MAR = window.TransforkNew.MAR || {};
window.TransforkNew.TOOLS = window.TransforkNew.TOOLS || {};

(function () {
    "use strict";

    function activate(tool) {
        window.TransforkNew.MAR.tool = tool || window.TransforkNew.TOOLS.state?.TOOL_NONE || "NONE";
        return window.TransforkNew.MAR.tool;
    }

    function deactivate() {
        return activate(window.TransforkNew.TOOLS.state?.TOOL_NONE || "NONE");
    }

    function current() {
        return window.TransforkNew.MAR.tool || window.TransforkNew.TOOLS.state?.TOOL_NONE || "NONE";
    }

    window.TransforkNew.TOOLS.activate = activate;
    window.TransforkNew.TOOLS.deactivate = deactivate;
    window.TransforkNew.TOOLS.current = current;
})();
