/*
Transfork/snap/edge-solver.js
Edge comparison for Transfork snapping.

Scope:
- Compares active bounds against candidate bounds.
- Selects closest X and Y edge snaps.
- Does not handle locks, visuals, correction, or final snap results.
*/

(function () {
    "use strict";

    window.Transfork = window.Transfork || {};
    window.Transfork.snap = window.Transfork.snap || {};

    function makeResult() {
        return {
            snapX: null,
            snapY: null,
            snapXTarget: null,
            snapYTarget: null,
            snapXOtherTarget: null,
            snapYOtherTarget: null,
            snapXSourceEdge: null,
            snapYSourceEdge: null,
            snapXTargetEdge: null,
            snapYTargetEdge: null,
            snapCandidates: {
                left: null,
                right: null,
                top: null,
                bottom: null
            },
            candidateDeltas: {
                left: null,
                right: null,
                top: null,
                bottom: null
            }
        };
    }

    function solveEdges(context) {
        const bounds =
              context &&
              context.bounds;

        const candidates =
              context &&
              context.candidates;

        const snapDistance =
              context &&
              context.snapDistance;

        const result =
              makeResult();

        if (
            !bounds ||
            !candidates
        ) {
            return result;
        }

        candidates.forEach(
            candidateTarget => {
                const otherTarget =
                      candidateTarget.target;

                const otherBounds =
                      candidateTarget.bounds;

                [
                    {
                        side: "left",
                        sourceEdge: "left",
                        targetEdge: "left",
                        delta: otherBounds.left - bounds.left
                    },
                    {
                        side: "left",
                        sourceEdge: "right",
                        targetEdge: "left",
                        delta: otherBounds.right - bounds.left
                    },
                    {
                        side: "right",
                        sourceEdge: "left",
                        targetEdge: "right",
                        delta: otherBounds.left - bounds.right
                    },
                    {
                        side: "right",
                        sourceEdge: "right",
                        targetEdge: "right",
                        delta: otherBounds.right - bounds.right
                    }
                ].forEach(
                    candidate => {
                        updateCandidateVisual(
                            result,
                            candidate,
                            otherBounds,
                            snapDistance
                        );

                        updateSnapX(
                            result,
                            candidate,
                            otherBounds,
                            otherTarget,
                            snapDistance
                        );
                    }
                );

                [
                    {
                        side: "top",
                        sourceEdge: "top",
                        targetEdge: "top",
                        delta: otherBounds.top - bounds.top
                    },
                    {
                        side: "top",
                        sourceEdge: "bottom",
                        targetEdge: "top",
                        delta: otherBounds.bottom - bounds.top
                    },
                    {
                        side: "bottom",
                        sourceEdge: "top",
                        targetEdge: "bottom",
                        delta: otherBounds.top - bounds.bottom
                    },
                    {
                        side: "bottom",
                        sourceEdge: "bottom",
                        targetEdge: "bottom",
                        delta: otherBounds.bottom - bounds.bottom
                    }
                ].forEach(
                    candidate => {
                        updateCandidateVisual(
                            result,
                            candidate,
                            otherBounds,
                            snapDistance
                        );

                        updateSnapY(
                            result,
                            candidate,
                            otherBounds,
                            otherTarget,
                            snapDistance
                        );
                    }
                );
            }
        );

        return result;
    }

    function updateCandidateVisual(
        result,
        candidate,
        otherBounds,
        snapDistance
    ) {
        const delta =
              candidate.delta;

        if (
            Math.abs(delta) <= snapDistance &&
            (
                result.candidateDeltas[candidate.side] === null ||
                Math.abs(delta) <
                Math.abs(result.candidateDeltas[candidate.side])
            )
        ) {
            result.candidateDeltas[candidate.side] =
                delta;

            result.snapCandidates[candidate.side] =
                otherBounds;
        }
    }

    function updateSnapX(
        result,
        candidate,
        otherBounds,
        otherTarget,
        snapDistance
    ) {
        const delta =
              candidate.delta;

        if (
            Math.abs(delta) <= snapDistance &&
            (
                result.snapX === null ||
                Math.abs(delta) < Math.abs(result.snapX)
            )
        ) {
            result.snapX =
                delta;

            result.snapXTarget =
                otherBounds;

            result.snapXOtherTarget =
                otherTarget;

            result.snapXSourceEdge =
                candidate.sourceEdge;

            result.snapXTargetEdge =
                candidate.targetEdge;
        }
    }

    function updateSnapY(
        result,
        candidate,
        otherBounds,
        otherTarget,
        snapDistance
    ) {
        const delta =
              candidate.delta;

        if (
            Math.abs(delta) <= snapDistance &&
            (
                result.snapY === null ||
                Math.abs(delta) < Math.abs(result.snapY)
            )
        ) {
            result.snapY =
                delta;

            result.snapYTarget =
                otherBounds;

            result.snapYOtherTarget =
                otherTarget;

            result.snapYSourceEdge =
                candidate.sourceEdge;

            result.snapYTargetEdge =
                candidate.targetEdge;
        }
    }

    window.Transfork.snap.solveEdges =
        solveEdges;
})();
