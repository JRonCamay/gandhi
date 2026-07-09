// TransforkV3 UI system
(function () {
    "use strict";
    const app = window.TransforkV3 = window.TransforkV3 || {};
    const api = { name: "UI", started: false };
    api.start = function () { api.started = true; };
    if (typeof app.registerSystem === "function") app.registerSystem("UI", api);
})();
