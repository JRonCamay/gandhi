/*
GitGit/bootloader.js
Loads all GitGit modules from the same GitGit folder.
*/

(function () {
    'use strict';

    if (window.__GitGitBootLoaded) return;
    window.__GitGitBootLoaded = true;

    const BASE =
        window.__GitGitBaseURL ||
        'https://raw.githubusercontent.com/JRonCamay/gandhi/main/GitGit/';

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
            if (!r.ok) {
                throw new Error('Cannot load ' + name + ' from ' + url);
            }

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

        console.log('[GitGit] Modules loaded from:', BASE);
    })().catch(error => {
        console.error('[GitGit bootloader]', error);
        alert('GitGit bootloader failed: ' + error.message);
    });

})();
