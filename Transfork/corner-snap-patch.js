/*
Transfork/corner-snap-patch.js
Surgical source patch that delegates snapping to Transfork/snapping.js.
*/

(function () {
    'use strict';

    if (window.__TransforkCornerSnapPatchLoaded) return;
    window.__TransforkCornerSnapPatchLoaded = true;

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

    function setActiveCornerSnap(xEdge, yEdge) {
        if (!xEdge || !yEdge) {
            window.TransforkCornerSnapPatch.activeCorner = null;
            return;
        }

        window.TransforkCornerSnapPatch.activeCorner = {
            xEdge,
            yEdge,
            time: Date.now()
        };
    }

    function findButton(overlay, text) {
        return Array.from(overlay.children).find(
            child => (child.textContent || '').trim() === text
        );
    }

    function setTransform(button, transform) {
        if (!button) return;
        button.style.transform = transform || '';
    }

    function updateControlOffset(overlay) {
        if (!overlay) return;

        const active = window.TransforkCornerSnapPatch.activeCorner;
        const fresh = active && Date.now() - active.time < 180;

        const pushY = fresh && active.yEdge === 'top'
            ? 10
            : fresh && active.yEdge === 'bottom'
                ? -10
                : 0;

        const leftTransform = fresh && active.xEdge === 'left'
            ? `translate(-14px, ${pushY}px)`
            : '';

        const rightTransform = fresh && active.xEdge === 'right'
            ? `translate(14px, ${pushY}px)`
            : '';

        ['⇋', '⇅', '⟲'].forEach(text => {
            setTransform(findButton(overlay, text), leftTransform);
        });

        ['🛠', '↔', '↕', '◲'].forEach(text => {
            setTransform(findButton(overlay, text), rightTransform);
        });
    }

    window.TransforkCornerSnapPatch = {
        setActiveCornerSnap,
        updateControlOffset,
        activeCorner: null
    };

    window.TRANSFORK_LOAD_TEXT = async function (url) {
        let code = previousLoadText
            ? await previousLoadText(url)
            : await defaultLoadText(url);

        if (!/transfork-main\.js(?:\?|$)/.test(url)) {
            return code;
        }

        code = code.replace(
            /            function findSnapPosition\(target, desiredX, desiredY\) \{[\s\S]*?\n            function getShearAdjustedBounds/,
`            function findSnapPosition(target, desiredX, desiredY) {
                if (
                    window.Transfork &&
                    window.Transfork.snapping &&
                    typeof window.Transfork.snapping.findSnapPosition === "function"
                ) {
                    return window.Transfork.snapping.findSnapPosition(
                        target,
                        desiredX,
                        desiredY
                    );
                }

                return {
                    x: desiredX,
                    y: desiredY
                };
            }

            function getShearAdjustedBounds`
        );

        code = code.replace(
`                if (document.activeElement !== alphaInput) {
`,
`                if (window.TransforkCornerSnapPatch) {
                    window.TransforkCornerSnapPatch.updateControlOffset(
                        overlay
                    );
                }

                if (document.activeElement !== alphaInput) {
`
        );

        console.log('[Transfork] snapping delegated to module');
        return code;
    };
})();
