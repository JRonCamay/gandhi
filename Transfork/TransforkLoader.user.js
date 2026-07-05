// ==UserScript==
// @name         Gandhi Transfork Modular Loader
// @namespace    http://tampermonkey.net/
// @version      1.16
// @description  Loads modular Transfork files dynamically
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const base = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/";
    const cache = "26070534";
    const modules = [
        "namespace.js",
        "state.js",
        "vm.js",
        "coords.js",
        "drawable.js",
        "math.js",
        "selectionBox.js",
        "transformOps.js",
        "snapshotLayer.js",
        "pixelBounds.js",
        "transformSnapshotGuard.js",
        "overlayTop.js",
        "snapGuideOverlay.js",
        "pixelBoxSync.js",
        "snapshotDragPixel.js",
        "snapshotToolsPixel.js",
        "resize.js",
        "rotate.js",
        "alpha.js",
        "flip.js",
        "skew.js",
        "legacyBridge.js",
        "main.js"
    ];

    function loadModule(name) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = base + name + "?v=" + cache;
            script.async = false;
            script.onload = resolve;
            script.onerror = () => reject(new Error("Failed to load " + name));
            document.documentElement.appendChild(script);
        });
    }

    async function loadAll() {
        if (window.__gandhiTransforkDynamicLoader) return;
        window.__gandhiTransforkDynamicLoader = true;

        for (const name of modules) {
            await loadModule(name);
        }

        console.log("Gandhi Transfork modular loader active 1.16 live-alpha-scan.");
    }

    loadAll().catch(error => console.error("Gandhi Transfork loader failed", error));
})();
