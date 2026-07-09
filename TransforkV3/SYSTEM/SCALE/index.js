// TransforkV3 SCALE system
(function () {
    "use strict";
    const app = window.TransforkV3 = window.TransforkV3 || {};
    const api = { name: "SCALE", started: false };
    api.start = function () { api.started = true; };
    if (typeof app.registerSystem === "function") app.registerSystem("SCALE", api);
})();
