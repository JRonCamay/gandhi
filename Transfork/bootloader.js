/*
Transfork/bootloader.js
Loads all Transfork modules from the same Transfork folder.
*/

(function () {
    'use strict';

    if (window.__TransforkBootLoaded) return;
    window.__TransforkBootLoaded = true;

    const BASE =
        window.__TransforkBaseURL ||
        'https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/';

    const MODULES = [
        'config.js',
        'utils.js',
        'vm.js',
        'asset-bake-engine.js',
        'overlay-tools.js',
        'skew-tools.js',
        'transfork-main.js'
    ];

    async function loadModule(name) {
        const url = BASE + name;

        if (!window.__TransforkLoadText || !window.__TransforkRunCode) {
            throw new Error('Transfork loader helpers are missing. Reinstall Transfork_Loader.user.js.');
        }

        const code = await window.__TransforkLoadText(url);
        window.__TransforkRunCode(code, url);
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
