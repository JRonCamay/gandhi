/*
GitGit/bootloader.js
Only this file knows the module list.
*/

(function () {
    'use strict';

    if (window.__GitGitBootLoaded) return;
    window.__GitGitBootLoaded = true;

    const CURRENT_URL =
        document.currentScript &&
        document.currentScript.src;

    const BASE =
        CURRENT_URL.substring(
            0,
            CURRENT_URL.lastIndexOf('/') + 1
        );

    const MODULES = [
        'config.js',
        'utils.js',
        'github-api.js',
        'formatter.js',
        'preview.js',
        'search-tools.js',
        'big-editor.js'
    ];

    async function load(name) {
        const url = BASE + name + '?v=' + Date.now();

        const code = await fetch(url, {
            cache: 'no-store'
        }).then(r => {
            if (!r.ok) throw new Error('Cannot load ' + name);
            return r.text();
        });

        const s = document.createElement('script');
        s.textContent = code + '\n//# sourceURL=' + url;
        document.documentElement.appendChild(s);
        s.remove();
    }

    (async () => {
        for (const file of MODULES) {
            await load(file);
        }

        console.log('[GitGit] Modules loaded.');
    })().catch(console.error);

})();
