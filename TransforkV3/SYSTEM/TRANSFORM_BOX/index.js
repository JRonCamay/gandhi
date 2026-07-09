// TransforkV3 TRANSFORM_BOX system
(function () {
    "use strict";
    const app = window.TransforkV3 = window.TransforkV3 || {};
    const api = { name: "TRANSFORM_BOX", started: false };
    api.start = function () { api.started = true; };
    if (typeof app.registerSystem === "function") app.registerSystem("TRANSFORM_BOX", api);
})();
