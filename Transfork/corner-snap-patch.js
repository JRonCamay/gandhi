/*
Transfork/corner-snap-patch.js
Surgical source patch for corner snapping accuracy.
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

    function chooseClosestCornerDelta(candidates, snapDistance) {
        let best = null;

        for (const candidate of candidates) {
            if (Math.abs(candidate.delta) > snapDistance) continue;

            if (
                !best ||
                Math.abs(candidate.delta) < Math.abs(best.delta)
            ) {
                best = candidate;
            }
        }

        return best;
    }

    window.TransforkCornerSnapPatch = {
        chooseClosestCornerDelta
    };

    window.TRANSFORK_LOAD_TEXT = async function (url) {
        let code = previousLoadText
            ? await previousLoadText(url)
            : await defaultLoadText(url);

        if (!/transfork-main\.js(?:\?|$)/.test(url)) {
            return code;
        }

        code = code.replace(
`                    const topDelta =
                    snapXTarget.top -
                    bounds.top;

                    const bottomDelta =
                    snapXTarget.bottom -
                    bounds.bottom;

                    if (
                        Math.abs(topDelta) <=
                        snapDistance
                    ) {

                        snapY =
                        topDelta;

                        snapYTarget =
                        snapXTarget;

                        snapYOtherTarget =
                        snapXOtherTarget;

                        snapYSourceEdge =
                        "top";

                        snapYTargetEdge =
                        "top";

                    }
                    else if (
                        Math.abs(bottomDelta) <=
                        snapDistance
                    ) {

                        snapY =
                        bottomDelta;

                        snapYTarget =
                        snapXTarget;

                        snapYOtherTarget =
                        snapXOtherTarget;

                        snapYSourceEdge =
                        "bottom";

                        snapYTargetEdge =
                        "bottom";

                    }
`,
`                    const cornerY =
                    window.TransforkCornerSnapPatch.chooseClosestCornerDelta(
                        [
                            {
                                delta: snapXTarget.top - bounds.top,
                                sourceEdge: "top",
                                targetEdge: "top"
                            },
                            {
                                delta: snapXTarget.bottom - bounds.top,
                                sourceEdge: "bottom",
                                targetEdge: "top"
                            },
                            {
                                delta: snapXTarget.top - bounds.bottom,
                                sourceEdge: "top",
                                targetEdge: "bottom"
                            },
                            {
                                delta: snapXTarget.bottom - bounds.bottom,
                                sourceEdge: "bottom",
                                targetEdge: "bottom"
                            }
                        ],
                        snapDistance
                    );

                    if (cornerY) {
                        snapY =
                        cornerY.delta;

                        snapYTarget =
                        snapXTarget;

                        snapYOtherTarget =
                        snapXOtherTarget;

                        snapYSourceEdge =
                        cornerY.sourceEdge;

                        snapYTargetEdge =
                        cornerY.targetEdge;
                    }
`
        );

        code = code.replace(
`                    const leftDelta =
                    snapYTarget.left -
                    bounds.left;

                    const rightDelta =
                    snapYTarget.right -
                    bounds.right;

                    if (
                        Math.abs(leftDelta) <=
                        snapDistance
                    ) {

                        snapX =
                        leftDelta;

                        snapXTarget =
                        snapYTarget;

                        snapXOtherTarget =
                        snapYOtherTarget;

                        snapXSourceEdge =
                        "left";

                        snapXTargetEdge =
                        "left";

                    }
                    else if (
                        Math.abs(rightDelta) <=
                        snapDistance
                    ) {

                        snapX =
                        rightDelta;

                        snapXTarget =
                        snapYTarget;

                        snapXOtherTarget =
                        snapYOtherTarget;

                        snapXSourceEdge =
                        "right";

                        snapXTargetEdge =
                        "right";

                    }
`,
`                    const cornerX =
                    window.TransforkCornerSnapPatch.chooseClosestCornerDelta(
                        [
                            {
                                delta: snapYTarget.left - bounds.left,
                                sourceEdge: "left",
                                targetEdge: "left"
                            },
                            {
                                delta: snapYTarget.right - bounds.left,
                                sourceEdge: "right",
                                targetEdge: "left"
                            },
                            {
                                delta: snapYTarget.left - bounds.right,
                                sourceEdge: "left",
                                targetEdge: "right"
                            },
                            {
                                delta: snapYTarget.right - bounds.right,
                                sourceEdge: "right",
                                targetEdge: "right"
                            }
                        ],
                        snapDistance
                    );

                    if (cornerX) {
                        snapX =
                        cornerX.delta;

                        snapXTarget =
                        snapYTarget;

                        snapXOtherTarget =
                        snapYOtherTarget;

                        snapXSourceEdge =
                        cornerX.sourceEdge;

                        snapXTargetEdge =
                        cornerX.targetEdge;
                    }
`
        );

        code = code.replace(
            /left:\s*"-26px",\s*top:\s*"0px"/,
            'left: "-38px",\n                    top: "8px"'
        );

        code = code.replace(
            /left:\s*"-26px",\s*top:\s*"24px"/,
            'left: "-38px",\n                    top: "32px"'
        );

        code = code.replace(
            /left:\s*"-26px",\s*top:\s*"48px"/,
            'left: "-38px",\n                    top: "56px"'
        );

        console.log('[Transfork] corner snap accuracy patch applied');
        return code;
    };
})();
