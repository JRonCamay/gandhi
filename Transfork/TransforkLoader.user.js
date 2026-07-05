// ==UserScript==
// @name         Gandhi Transfork Modular Loader
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Loads modular Transfork files in dependency order
// @match        *://www.cocrea.world/*
// @grant        none
// @require      https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/namespace.js
// @require      https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/vm.js
// @require      https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/coords.js
// @require      https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/selectionBox.js
// @require      https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/snapshotDrag.js
// @require      https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/main.js
// ==/UserScript==

(function () {
    "use strict";

    if (!window.Transfork || !window.Transfork.main) {
        console.error("Transfork modular loader failed to load modules.");
    }
})();
