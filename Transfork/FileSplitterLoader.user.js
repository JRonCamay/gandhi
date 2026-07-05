// ==UserScript==
// @name         Gandhi File Splitter Loader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Loads Gandhi File Splitter from the Gandhi repository
// @match        *://chatgpt.com/*
// @match        *://github.com/*
// @match        *://raw.githubusercontent.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const script = document.createElement("script");
    script.src = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/FileSplitter.user.js?v=" + Date.now();
    script.onload = () => console.log("Gandhi File Splitter loaded.");
    script.onerror = () => console.error("Failed to load Gandhi File Splitter.");

    document.head.appendChild(script);
})();
