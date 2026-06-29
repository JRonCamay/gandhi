// ==UserScript==
// @name         Gandhi Composer Loader
// @namespace    GandhiComposer
// @version      0.2
// @match        https://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const BASE = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Composer/";

   const MODULES = {
       core: [
           "parser.js",
           "generator.js",
           "library.js",
           "paths.js",
           "sockets.js",
           "blockly.js"
       ],

       renderer: [
           "renderer/BlockStyle.js",
           "renderer/Shapes.js",
           "renderer.js"
       ],

       ui: [
           "ui.js"
       ]
   };

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
            for (const group of Object.values(MODULES)) {
                for (const file of group) {
                    await load(file);
                }
            }

            console.log("[Composer] Ready.");
        }
        catch (e) {
            console.error("[Composer] FAILED", e);
        }
    }

    boot();

})();
