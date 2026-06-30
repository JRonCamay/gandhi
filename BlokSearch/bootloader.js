/*
BlokSearch/bootloader.js
Loads all BlokSearch modules from the same BlokSearch folder.
*/

(function () {
    'use strict';

    if (window.__BlokSearchBootLoaded) return;
    window.__BlokSearchBootLoaded = true;

    const BASE =
        window.__BlokSearchBaseURL ||
        'https://raw.githubusercontent.com/JRonCamay/gandhi/main/BlokSearch/';

    const MODULES = [
        'config.js',
        'utils.js',
        'smart-search-data.js',
        'history.js',
        'blockly-adapter.js',
        'ui.js',
        'bloksearch-main.js'
    ];

    async function loadModule(name) {
        const url = BASE + name;

        if (!window.__BlokSearchLoadText || !window.__BlokSearchRunCode) {
            throw new Error('BlokSearch loader helpers are missing. Reinstall BlokSearch_Loader.user.js.');
        }

        const code = await window.__BlokSearchLoadText(url);
        window.__BlokSearchRunCode(code, url);
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
