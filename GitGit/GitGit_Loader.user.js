// ==UserScript==
// @name         GitGit Loader
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  GitGit Modular Loader
// @match        https://github.com/*
// @match        https://raw.githubusercontent.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
    'use strict';

    const BOOT =
        'https://raw.githubusercontent.com/JRonCamay/gandhi/main/GitGit/bootloader.js';

    const BASE =
        BOOT.substring(
            0,
            BOOT.lastIndexOf('/') + 1
        );

    window.__GitGitBaseURL = BASE;

    window.__GitGitLoadText = function (url) {
        return new Promise((resolve, reject) => {
            GM_xmlhttpRequest({
                method: 'GET',
                url: url + '?v=' + Date.now(),
                onload(response) {
                    if (response.status >= 200 && response.status < 300) {
                        resolve(response.responseText);
                    } else {
                        reject(new Error('HTTP ' + response.status));
                    }
                },
                onerror() {
                    reject(new Error('Network error'));
                }
            });
        });
    };

    window.__GitGitRunCode = function (code, url) {
        new Function(code + '\n//# sourceURL=' + url)();
    };

    window.__GitGitLoadText(BOOT)
        .then(code => window.__GitGitRunCode(code, BOOT))
        .catch(error => {
            console.error(error);
            alert('GitGit Loader: ' + error.message);
        });
})();
