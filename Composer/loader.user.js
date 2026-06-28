// ==UserScript==
// @name         Gandhi Composer Loader
// @namespace    GandhiComposer
// @version      0.1
// @description  Gandhi Composer
// @match        https://www.cocrea.world/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    const BASE = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Composer/";

    const MODULES = [
        "ui.js",
        "parser.js",
        "library.js",
        "generator.js"
    ];

    window.Composer = {
        version: "0.1",
        ui: {},
        parser: {},
        generator: {},
        library: {},
        cache: {}
    };

    function loadModule(file) {
        return new Promise((resolve, reject) => {

            GM_xmlhttpRequest({
                method: "GET",
                url: BASE + file + "?v=" + Date.now(),

                onload(res) {

                    try {
                        new Function(res.responseText)();
                        console.log("[Composer] Loaded:", file);
                        resolve();
                    } catch (e) {
                        console.error("[Composer] Error inside", file, e);
                        reject(e);
                    }

                },

                onerror(err) {
                    console.error("[Composer] Failed:", file, err);
                    reject(err);
                }

            });

        });
    }

    async function boot() {

        console.log("[Composer] Booting...");

        for (const file of MODULES) {
            await loadModule(file);
        }

        console.log("[Composer] Ready.");

    }

    boot();

})();
