// ==UserScript==
// @name         GitGit Loader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Stable loader for GitGit Big GitHub Editor modules
// @author       You
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    const BOOTLOADER_URL =
        'https://raw.githubusercontent.com/JRonCamay/gandhi/main/GitGit/bootloader.js';

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url + '?v=' + Date.now(),
                onload(response) {
                    if (response.status < 200 || response.status >= 300) {
                        reject(new Error('Load failed ' + response.status + ': ' + url));
                        return;
                    }

                    try {
                        const script = document.createElement('script');
                        script.textContent =
                            response.responseText +
                            '\n//# sourceURL=' + url;

                        document.documentElement.appendChild(script);
                        script.remove();
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                },
                onerror() {
                    reject(new Error('Network error loading: ' + url));
                }
            });
        });
    }

    loadScript(BOOTLOADER_URL).catch(error => {
        console.error('[GitGit Loader]', error);
        alert('GitGit loader failed: ' + error.message);
    });
})();
