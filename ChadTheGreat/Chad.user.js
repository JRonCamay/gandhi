// ==UserScript==
// @name         ChadTheGreat
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Modular Chad companion entry file
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    if (window.__ChadTheGreatLoaded) return;
    window.__ChadTheGreatLoaded = true;

    window.Chad = window.Chad || {};

    const BASE =
        "https://raw.githubusercontent.com/JRonCamay/gandhi/main/ChadTheGreat/";

    const FILES = [
        "data.js",
        "storage.js",
        "scanner.js",
        "actions.js",
        "ui.js",
        "agents.js"
    ];

    async function loadFile(file) {
        const res = await fetch(BASE + file + "?v=" + Date.now(), {
            cache: "no-store"
        });

        if (!res.ok) {
            throw new Error(
                "Failed to load " +
                file +
                ": " +
                res.status +
                " " +
                res.statusText
            );
        }

        const code = await res.text();

        (0, eval)(
            code +
            "\n//# sourceURL=ChadTheGreat/" +
            file
        );
    }

    async function start() {
        for (const file of FILES) {
            await loadFile(file);
        }

        if (
            window.Chad &&
            window.Chad.ui &&
            typeof window.Chad.ui.start === "function"
        ) {
            window.Chad.ui.start();
        }
    }

    start().catch(error => {
        console.error("[ChadTheGreat]", error);
        alert(
            "ChadTheGreat failed to load.\n\n" +
            error.message
        );
    });
})();
