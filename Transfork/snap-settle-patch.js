/*
Transfork/snap-settle-patch.js
Injects final snap settling after mouse release.
*/

(function () {
    'use strict';

    if (window.__TransforkSnapSettlePatchLoaded) return;
    window.__TransforkSnapSettlePatchLoaded = true;

    const previousLoadText =
        typeof window.TRANSFORK_LOAD_TEXT === 'function'
            ? window.TRANSFORK_LOAD_TEXT
            : null;

    async function defaultLoadText(url) {
        const response = await fetch(url + '?v=' + Date.now(), {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error('HTTP ' + response.status + ' loading ' + url);
        }

        return response.text();
    }

    window.TRANSFORK_LOAD_TEXT = async function (url) {
        let code = previousLoadText
            ? await previousLoadText(url)
            : await defaultLoadText(url);

        if (!/transfork-main\.js(?:\?|$)/.test(url)) {
            return code;
        }

        code = code.replace(
`                    resizing = false;
                    dragging = false;
                    rotating = false;
                    transformTarget = null;
`,
`                    if (
                        window.Transfork &&
                        window.Transfork.snapping &&
                        typeof window.Transfork.snapping.settleSnap === "function"
                    ) {
                        window.Transfork.snapping.settleSnap(
                            stageSpriteDrag
                            ? dragTarget
                            : transformTarget
                        );
                    }

                    resizing = false;
                    dragging = false;
                    rotating = false;
                    transformTarget = null;
`
        );

        console.log('[Transfork] snap settle patch applied');
        return code;
    };
})();
