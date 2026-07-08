window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.MAR = window.TransforkNew.MAR || {};
window.TransforkNew.TOOLS = window.TransforkNew.TOOLS || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.TOOLS.activate.js.activate", file: "TransforkNew/TOOLS/activate.js", functionName: "activate", purpose: "local process member registration for activate", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.activate.js.deactivate", file: "TransforkNew/TOOLS/activate.js", functionName: "deactivate", purpose: "local process member registration for deactivate", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.activate.js.current", file: "TransforkNew/TOOLS/activate.js", functionName: "current", purpose: "local process member registration for current", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

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
