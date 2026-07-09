// TransforkV3 Main
(function () {
    "use strict";

    const ROOT = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/TransforkV3";
    const MODULES = [
        "SYSTEM/MOVE/index.js",
        "SYSTEM/SCALE/index.js",
        "SYSTEM/TRANSFORM_BOX/index.js",
        "SYSTEM/UI/index.js"
    ];

    const app = window.TransforkV3 = window.TransforkV3 || {};
    app.systems = app.systems || {};
    app.runtime = app.runtime || {};
    app.runtime.root = ROOT;
    app.runtime.loadedSystems = app.runtime.loadedSystems || [];

    app.registerSystem = function (name, api) {
        app.systems[name] = api || {};
        return app.systems[name];
    };

    function loadScript(path) {
        return new Promise(function (resolve, reject) {
            const script = document.createElement("script");
            script.src = ROOT + "/" + path + "?t=" + Date.now();
            script.async = false;
            script.onload = function () { resolve(path); };
            script.onerror = function () { reject(new Error("Failed to load " + path)); };
            document.head.appendChild(script);
        });
    }

    async function start() {
        if (app.runtime.started) return;
        app.runtime.started = true;

        for (const path of MODULES) {
            await loadScript(path);
            app.runtime.loadedSystems.push(path);
        }

        ["UI", "TRANSFORM_BOX", "MOVE", "SCALE"].forEach(function (name) {
            const system = app.systems[name];
            if (system && typeof system.start === "function") system.start();
        });
    }

    app.start = start;
    start().catch(function (error) {
        console.error("[TransforkV3 Main]", error);
    });
})();
