// ==UserScript==
// @name         ChadTheGreat Loader
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Permanent loader for ChadTheGreat
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const ENTRY =
        "https://raw.githubusercontent.com/JRonCamay/gandhi/main/ChadTheGreat/Chad.user.js";

    async function load() {
        try {
            const response = await fetch(
                ENTRY + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );

            if (!response.ok) {
                throw new Error(
                    response.status +
                    " " +
                    response.statusText
                );
            }

            const code =
                await response.text();

            (0, eval)(
                code +
                "\n//# sourceURL=ChadTheGreat/Chad.user.js"
            );

        } catch (error) {

            console.error(
                "[ChadTheGreat Loader]",
                error
            );

            alert(
                "Failed to load ChadTheGreat.\n\n" +
                error.message
            );
        }
    }

    load();

})();
