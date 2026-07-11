// TransforkV3 Loader

(function () {
    "use strict";

    const ROOT = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/TransforkV3";
    const MAIN_URL = ROOT + "/TF3_Main.js";
    window.TransforkV3 = window.TransforkV3 || {};
    window.TransforkV3.runtime = window.TransforkV3.runtime || {};
    window.TransforkV3.runtime.root = ROOT;
    window.TransforkV3.runtime.mainUrl = MAIN_URL;

    function loadScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = url + "?v=" + Date.now();
            script.async = false;
            script.onload = () => resolve(url);
            script.onerror = () => reject(new Error("Failed to load " + url));
            document.head.appendChild(script);
        });
    }

    loadScript(MAIN_URL).catch(error => {
        console.error("[TF3 Boot]", error);
    });
})();
