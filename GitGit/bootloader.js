/*
GitGit bootloader
Put this file at:
GitGit/bootloader.js

This file loads the real GitGit app from the same GitGit folder.
You only install GitGit_Loader.user.js once in Tampermonkey.
After that, edit files in the GitGit folder on GitHub.
*/

(function () {
    'use strict';

    if (window.__gitgitBootloaderRunning) {
        return;
    }

    window.__gitgitBootloaderRunning = true;

    const BASE =
        'https://raw.githubusercontent.com/JRonCamay/gandhi/main/GitGit/';

    const FILES = [
        'config.js',
        'utils.js',
        'github-api.js',
        'formatter.js',
        'preview.js',
        'search-tools.js',
        'big-editor.js'
    ];

    function loadScript(url) {
        return fetch(url + '?v=' + Date.now(), {
            cache: 'no-store'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Load failed ' + response.status + ': ' + url);
                }

                return response.text();
            })
            .then(code => {
                const script = document.createElement('script');
                script.textContent =
                    code +
                    '\n//# sourceURL=' + url;

                document.documentElement.appendChild(script);
                script.remove();
            });
    }

    async function boot() {
        for (const file of FILES) {
            await loadScript(BASE + file);
        }

        console.log('[GitGit] loaded modules:', FILES);
    }

    boot().catch(error => {
        console.error('[GitGit bootloader]', error);
        alert('GitGit bootloader failed: ' + error.message);
    });
})();
