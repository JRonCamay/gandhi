window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.TOOLS = window.TransforkNew.TOOLS || {};

(function () {
    "use strict";

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
