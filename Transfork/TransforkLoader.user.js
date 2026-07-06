// ==UserScript==
// @name         Gandhi Transfork Modular Loader
// @namespace    http://tampermonkey.net/
// @version      1.31
// @description  Loads modular Transfork files dynamically
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const base = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/";
    const cache = "26070609";
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
        "orderFix.js",
        "pixelBounds.js",
        "transformSnapshotGuard.js",
        "overlayTop.js",
        "snapGuideOverlay.js",
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

    async function loadModule(name) {
        const url = base + name + "?v=" + cache;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch " + name + ": " + response.status);
        const source = await response.text();
        Function(source + "\n//# sourceURL=" + url)();
    }

    async function loadAll() {
        if (window.__gandhiTransforkDynamicLoader) return;
        window.__gandhiTransforkDynamicLoader = true;
        for (const name of modules) await loadModule(name);
        console.log("Gandhi Transfork modular loader active 1.31 final-center-compensation.");
    }

    loadAll().catch(error => console.error("Gandhi Transfork loader failed", error));
})();