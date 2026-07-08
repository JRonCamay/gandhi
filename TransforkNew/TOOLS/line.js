window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.TOOLS = window.TransforkNew.TOOLS || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.TOOLS.line.js.acquireLine", file: "TransforkNew/TOOLS/line.js", functionName: "acquireLine", purpose: "local process member registration for acquireLine", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.line.js.releaseLine", file: "TransforkNew/TOOLS/line.js", functionName: "releaseLine", purpose: "local process member registration for releaseLine", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.line.js.getActiveLine", file: "TransforkNew/TOOLS/line.js", functionName: "getActiveLine", purpose: "local process member registration for getActiveLine", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    let activeLine = null;

    function acquireLine(id) {
        if (activeLine) return false;
        activeLine = id;
        return true;
    }

    function releaseLine(id) {
        if (activeLine !== id) return;
        activeLine = null;
    }

    function getActiveLine() {
        return activeLine;
    }

    window.TransforkNew.TOOLS.line = {
        acquireLine,
        releaseLine,
        getActiveLine
    };
})();
