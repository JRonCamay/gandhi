// ==UserScript==
// @name         Gandhi File Splitter Loader
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Loads Gandhi File Splitter from the Gandhi repository
// @match        *://chatgpt.com/*
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// ==/UserScript==

(function () {
    "use strict";

    const url = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/FileSplitter.user.js?v=" + Date.now();

    GM_xmlhttpRequest({
        method: "GET",
        url,
        onload(response) {
            if (response.status < 200 || response.status >= 300) {
                console.error("Failed to load Gandhi File Splitter:", response.status);
                return;
            }

            try {
                Function(response.responseText)();
                console.log("Gandhi File Splitter loaded.");
            }
            catch (error) {
                console.error("Gandhi File Splitter error:", error);
            }
        },
        onerror(error) {
            console.error("Failed to load Gandhi File Splitter:", error);
        }
    });
})();
