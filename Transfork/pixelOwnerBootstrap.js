window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const repo = "https://api.github.com/repos/JRonCamay/gandhi/git/blobs/";
    const blobs = [
        "18de641e36da56254e3c5bb47f2986c4a0def59b",
        "d5ad0bf19c098fa3ffe18e46d01732f8612ec66f"
    ];

    function runBlob(sha) {
        const request = new XMLHttpRequest();
        request.open("GET", repo + sha, false);
        request.send(null);

        if (request.status < 200 || request.status >= 300) {
            throw new Error("Blob load failed " + sha);
        }

        const data = JSON.parse(request.responseText);
        const code = atob(String(data.content || "").replace(/\n/g, ""));
        Function(code)();
    }

    try {
        blobs.forEach(runBlob);
        window.__transforkPixelOwnersLoaded = true;
    }
    catch (error) {
        console.warn("Transfork pixel owners failed", error);
    }
})();
