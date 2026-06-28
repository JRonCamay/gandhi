// ==UserScript==
// @name         Gandhi Composer Loader
// @namespace    GandhiComposer
// @version      0.1
// @description  Loads Gandhi Composer modules
// @match        https://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // =====================================================
    // CONFIG
    // =====================================================

    const MODULES = [
        "ui.js",
        "parser.js",
        "library.js",
        "generator.js"
    ];

    // Change this to wherever you keep the files.
    //
    // Example:
    //
    // http://localhost:5500/Composer/
    //
    // or
    //
    // https://raw.githubusercontent.com/USERNAME/gandhi/main/Composer/
    //

    const BASE =
        "https://raw.githubusercontent.com/JRonCamay/gandhi/refs/heads/main/Composer/";

    // =====================================================

    function loadScript(file) {
        window.Composer = {
        
            version: "0.1",
        
            ui: {},
        
            parser: {},
        
            generator: {},
        
            library: {},
        
            cache: {}
        
        };
        return new Promise((resolve, reject) => {

            const script = document.createElement("script");

            script.src = BASE + file;

            script.onload = () => {
                console.log("[Composer] Loaded", file);
                resolve();
            };

            script.onerror = () => {
                console.error("[Composer] Failed", file);
                reject(file);
            };

            document.head.appendChild(script);

        });

    }

    async function boot() {

        console.log("[Composer] Booting...");

        for (const file of MODULES) {

            await loadScript(file);

        }

        console.log("[Composer] Ready.");

    }

    boot();

})();
