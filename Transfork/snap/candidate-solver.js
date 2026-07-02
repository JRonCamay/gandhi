/*
Transfork/snap/candidate-solver.js
Candidate discovery for Transfork snapping.

Scope:
- Enumerates valid snap targets only.
- Does not solve edge deltas, locks, visuals, or final snap results.
*/

(function () {
    "use strict";

    window.Transfork = window.Transfork || {};
    window.Transfork.snap = window.Transfork.snap || {};

    function findCandidates(context) {
        const target =
              context &&
              context.target;

        const renderer =
              context &&
              context.renderer;

        const runtime =
              context &&
              context.runtime;

        if (
            !target ||
            !renderer ||
            !runtime ||
            !runtime.targets
        ) {
            return [];
        }

        const candidates = [];

        runtime.targets.forEach(
            otherTarget => {
                if (
                    otherTarget === target ||
                    otherTarget.isStage
                ) {
                    return;
                }

                const otherDrawable =
                      renderer._allDrawables[
                          otherTarget.drawableID
                      ];

                if (
                    !otherDrawable ||
                    otherDrawable._visible === false
                ) {
                    return;
                }

                candidates.push(
                    {
                        target: otherTarget,
                        bounds: otherDrawable.getAABB()
                    }
                );
            }
        );

        return candidates;
    }

    window.Transfork.snap.findCandidates =
        findCandidates;
})();
