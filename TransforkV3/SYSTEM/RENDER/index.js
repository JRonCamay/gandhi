// TransforkV3 RENDER system
(function () {
    "use strict";

    const app = window.TransforkV3 = window.TransforkV3 || {};

    function refresh() {
        const box = document.querySelector("#transfork-v3-transform-box");
        if (!box) return null;
        const version = box.querySelector("#transfork-v3-version-box");
        if (version) version.textContent = "TransforkV3 v" + (app.VERSION || "dev") + " | layout only";
        return box;
    }

    const api = {
        name: "RENDER",
        started: false,
        start: function () {
            api.started = true;
            refresh();
        },
        refresh
    };

    if (typeof app.registerSystem === "function") app.registerSystem("RENDER", api);
})();