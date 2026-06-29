// ==UserScript==
// @name         Gandhi Composer Loader
// @namespace    GandhiComposer
// @version      0.2
// @match        https://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const BASE = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/";

    const MODULES = [
        "Composer/parser.js",
        "Composer/library.js",
        "Composer/paths.js",
        "Composer/sockets.js",
        "composer/renderer/Shapes.js",
        "composer/BlockStyle.js",
        "Composer/renderer.js",
        "Composer/blockly.js",
        "Composer/generator.js",
        "Composer/ui.js"
    ];
    window.Composer = {
        version: "0.1",

        ui: {},
        parser: {},
        library: {},
        generator: {},
        renderer: {},
        paths: {},
        sockets: {},
        blockly: {},
        Shapes: {},
        BlockStyle: {},

        cache: {}
    };

    function load(file) {
        return fetch(BASE + file + "?v=" + Date.now())
            .then(r => {
                if (!r.ok) throw new Error(file + " : " + r.status);
                return r.text();
            })
            .then(code => {
                console.log("[Composer] Executing", file);
                eval(code);
                console.log("[Composer] Loaded", file);
            });
    }

    async function boot() {
        console.log("[Composer] Booting...");

        try {
            for (const file of MODULES) {
                await load(file);
            }

            console.log("[Composer] Ready.");
        }
        catch (e) {
            console.error("[Composer] FAILED", e);
        }
    }

    boot();

})();
