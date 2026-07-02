/*
Transfork/bootloader.js
Loads all Transfork modules from the same Transfork folder.
*/

(function () {
    'use strict';

    if (window.__TransforkBootLoaded) return;
    window.__TransforkBootLoaded = true;

    const BASE =
        typeof TRANSFORK_BASE === 'string'
            ? TRANSFORK_BASE
            : 'https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/';

    const MODULES = [
        'config.js',
        'utils.js',
        'engine/simulation.js',
        'engine/transform.js',
        'geometry.js',
        'alpha-tools.js',
        'tools/move-tool.js',
        'tools/resize-tool.js',
        'ui/overlay.js',
        'tools/move-tool.js',
        'snap-visuals.js',
        'snapping.js',
        'snapping-v2.js',
        'snapping-v3.js',
        'vm.js',
        'asset-bake-engine.js',
        'overlay-tools.js',
        'skew-tools.js',
        'corner-snap-patch.js',
        'snap-settle-patch.js',
        'transfork-main.js'
    ];

    async function fallbackFetch(url) {
        const response = await fetch(url + '?v=' + Date.now(), {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ' loading ' + url);
        }

        return response.text();
    }

    function fallbackRun(code, url) {
        new Function(code + '\n//# sourceURL=' + url)();
    }

    async function loadModule(name) {
        const url = BASE + name;

        const loadText =
            typeof TRANSFORK_LOAD_TEXT === 'function'
                ? TRANSFORK_LOAD_TEXT
                : fallbackFetch;

        const runCode =
            typeof TRANSFORK_RUN_CODE === 'function'
                ? TRANSFORK_RUN_CODE
                : fallbackRun;

        const code = await loadText(url);
        runCode(code, url);
    }

    async function boot() {
        for (const moduleName of MODULES) {
            await loadModule(moduleName);
        }

        console.log('[Transfork] loaded from:', BASE);
    }

    boot().catch(error => {
        console.error('[Transfork bootloader]', error);
        alert('Transfork bootloader failed: ' + error.message);
    });
})();
