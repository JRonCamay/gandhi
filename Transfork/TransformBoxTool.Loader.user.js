// ==UserScript==
// @name         Gandhi Transfork Modular Loader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Loads Transfork transform box modules in deterministic order
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const transforkModuleLoaderState260705_m8q2vz = {
        baseUrl: "https://raw.githubusercontent.com/JRonCamay/gandhi/main/",
        loaded: false,
        loading: false,
        modules: [
            "TransformBoxTool.js",
            "TransforkSpriteSnapshotDragPatch.js"
        ]
    };

    function transforkInjectModule260705_p7n4kc(path, source) {
        const script = document.createElement("script");
        script.textContent =
        source +
        "\n//# sourceURL=" +
        transforkModuleLoaderState260705_m8q2vz.baseUrl +
        path;

        document.documentElement.appendChild(script);
        script.remove();
    }

    async function transforkLoadModule260705_h3v9pt(path) {
        const url =
        transforkModuleLoaderState260705_m8q2vz.baseUrl +
        path;

        const response = await fetch(url, {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                "Failed to load Transfork module: " +
                path +
                " (" +
                response.status +
                ")"
            );
        }

        const source = await response.text();
        transforkInjectModule260705_p7n4kc(path, source);
    }

    async function transforkRunModules260705_x2md8r() {
        const state = transforkModuleLoaderState260705_m8q2vz;

        if (state.loaded || state.loading) {
            return;
        }

        state.loading = true;

        try {
            for (const path of state.modules) {
                await transforkLoadModule260705_h3v9pt(path);
            }

            state.loaded = true;
            console.log(
                "Gandhi Transfork modules loaded",
                state.modules
            );
        }
        catch (error) {
            console.error(
                "Gandhi Transfork module load failed",
                error
            );
        }
        finally {
            state.loading = false;
        }
    }

    transforkRunModules260705_x2md8r();
})();
