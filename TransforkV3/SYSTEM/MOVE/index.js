// TransforkV3 MOVE system
(function () {
    "use strict";
    const app = window.TransforkV3 = window.TransforkV3 || {};
    const api = { name: "MOVE", started: false };
    api.start = function () { api.started = true; };
    if (typeof app.registerSystem === "function") app.registerSystem("MOVE", api);
})();
