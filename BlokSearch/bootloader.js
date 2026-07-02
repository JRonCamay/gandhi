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
        'bloksearch-text-format.js',
        'bloksearch-block-shapes.js',
        'bloksearch-search-engine.js',
        'search-controller.js',
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

    async function fetchModule(name, loadText) {
        const url = BASE + name;
        const code = await loadText(url);

        return {
            name,
            url,
            code
        };
    }

    function patchMainSearchPipeline(code) {
        const target = `filteredEntries = [
                ...smartResults,
                ...normalResults
            ];`;

        const replacement = `filteredEntries = [
                ...smartResults,
                ...normalResults
            ];

            if (
                filteredEntries.length === 0 &&
                window.BlokSearch &&
                window.BlokSearch.searchEngine &&
                window.BlokSearch.searchEngine.findFuzzyResults
            ) {
                filteredEntries = window.BlokSearch.searchEngine.findFuzzyResults({
                    cachedBlocks,
                    q,
                    reporterMode,
                    targetedConnection,
                    isBooleanTarget
                });
            }`;

        if (!code.includes(target)) return code;
        return code.replace(target, replacement);
    }

    function prepareModuleCode(loadedModule) {
        if (loadedModule.name === 'bloksearch-main.js') {
            return patchMainSearchPipeline(loadedModule.code);
        }

        return loadedModule.code;
    }

    async function boot() {
        const loadText =
            typeof BLOKSEARCH_LOAD_TEXT === 'function'
                ? BLOKSEARCH_LOAD_TEXT
                : fallbackFetch;

        const runCode =
            typeof BLOKSEARCH_RUN_CODE === 'function'
                ? BLOKSEARCH_RUN_CODE
                : fallbackRun;

        const loadedModules = await Promise.all(
            MODULES.map(moduleName => fetchModule(moduleName, loadText))
        );

        for (const loadedModule of loadedModules) {
            runCode(prepareModuleCode(loadedModule), loadedModule.url);
        }

        console.log('[BlokSearch] loaded from:', BASE);
    }

    boot().catch(error => {
        console.error('[BlokSearch bootloader]', error);
        alert('BlokSearch bootloader failed: ' + error.message);
    });
})();