/*
BlokSearch/bootloader.js
Loads all BlokSearch modules from the same BlokSearch folder.
*/

(function () {
    'use strict';

    if (window.__BlokSearchBootLoaded) return;
    window.__BlokSearchBootLoaded = true;

    const BASE =
        typeof BLOKSEARCH_BASE === 'string'
            ? BLOKSEARCH_BASE
            : 'https://raw.githubusercontent.com/JRonCamay/gandhi/main/BlokSearch/';

    const MODULES = [
        'config.js',
        'utils.js',
        'smart-search-data.js',
        'history.js',
        'blockly-adapter.js',
        'ui.js',
        'bloksearch-block-shapes.js',
        'bloksearch-main.js'
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
            typeof BLOKSEARCH_LOAD_TEXT === 'function'
                ? BLOKSEARCH_LOAD_TEXT
                : fallbackFetch;

        const runCode =
            typeof BLOKSEARCH_RUN_CODE === 'function'
                ? BLOKSEARCH_RUN_CODE
                : fallbackRun;

        const code = await loadText(url);
        runCode(code, url);
    }

    async function boot() {
        for (const moduleName of MODULES) {
            await loadModule(moduleName);
        }

        console.log('[BlokSearch] loaded from:', BASE);
    }

    boot().catch(error => {
        console.error('[BlokSearch bootloader]', error);
        alert('BlokSearch bootloader failed: ' + error.message);
    });
})();
