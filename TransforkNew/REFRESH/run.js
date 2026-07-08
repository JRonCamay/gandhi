window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.REFRESH = window.TransforkNew.REFRESH || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "RENDER.local.TransforkNew.REFRESH.run.js.run", file: "TransforkNew/REFRESH/run.js", functionName: "run", purpose: "local process member registration for run", manager: "RENDER", station: 0 }
        ].forEach(register);
    })();

    function run(state = {}) {
        window.TransforkNew.REFRESH.boundingBox?.(state);
        window.TransforkNew.REFRESH.buttons?.(state);
        window.TransforkNew.REFRESH.overlay?.(state);
    }

    window.TransforkNew.REFRESH.run = run;
})();
