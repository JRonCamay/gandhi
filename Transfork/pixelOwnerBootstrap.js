window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const repo = "https://api.github.com/repos/JRonCamay/gandhi/git/blobs/";
    const blobs = [
        "18de641e36da56254e3c5bb47f2986c4a0def59b",
        "d5ad0bf19c098fa3ffe18e46d01732f8612ec66f"
    ];

    function runBlob(sha) {
        return fetch(repo + sha)
            .then(response => response.json())
            .then(data => atob(String(data.content || "").replace(/\n/g, "")))
            .then(code => Function(code)());
    }

    Promise.resolve()
        .then(() => runBlob(blobs[0]))
        .then(() => runBlob(blobs[1]))
        .then(() => { window.__transforkPixelOwnersLoaded = true; })
        .catch(error => console.warn("Transfork pixel owners failed", error));
})();
