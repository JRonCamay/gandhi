window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    function loadText(url) {
        const request = new XMLHttpRequest();
        request.open("GET", url, false);
        request.send(null);
        if (request.status < 200 || request.status >= 300) return "";
        return request.responseText || "";
    }

    function runText(code) {
        if (!code) return;
        const script = document.createElement("script");
        script.textContent = code;
        document.documentElement.appendChild(script);
        script.remove();
    }

    function runBlob(sha) {
        const url = "https://api.github.com/repos/JRonCamay/gandhi/git/blobs/" + sha;
        const response = loadText(url);
        if (!response) return false;
        const data = JSON.parse(response);
        runText(atob(String(data.content || "").replace(/\n/g, "")));
        return true;
    }

    runText(loadText("https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/pixelTransformedBounds.js?v=26070522"));

    if (!runBlob("18de641e36da56254e3c5bb47f2986c4a0def59b")) {
        console.warn("Transfork pixel drag owner failed to load");
        return;
    }

    if (window.Transfork.snapshotDrag && typeof window.Transfork.snapshotDrag.bind !== "function") {
        window.Transfork.snapshotDrag.bind = function () {};
    }
})();
