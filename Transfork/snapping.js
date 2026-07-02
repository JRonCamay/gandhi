/*
Transfork/snapping.js
Stateless snapping engine for Transfork.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};

    function getRenderer() {
        if (!window.vm) return null;
        return window.vm.renderer || window.vm.runtime?.renderer || null;
    }

    function getCanvas(renderer) {
        return renderer?.canvas || document.querySelector('canvas');
    }

    function getNativeSize(renderer) {
        if (renderer && typeof renderer.getNativeSize === 'function') {
            return renderer.getNativeSize();
        }

        return [480, 360];
    }

    function offsetBounds(bounds, dx, dy) {
        return {
            left: bounds.left + dx,
            right: bounds.right + dx,
            top: bounds.top + dy,
            bottom: bounds.bottom + dy
        };
    }

    function makeCandidate(axis, side, sourceEdge, targetEdge, delta, otherBounds, otherTarget) {
        return {
            axis,
            side,
            sourceEdge,
            targetEdge,
            delta,
            otherBounds,
            otherTarget
        };
    }

    function pickBest(candidates, snapDistance) {
        let best = null;

        for (const candidate of candidates) {
            if (Math.abs(candidate.delta) > snapDistance) continue;

            if (!best || Math.abs(candidate.delta) < Math.abs(best.delta)) {
                best = candidate;
            }
        }

        return best;
    }

    function getSnapDistance(renderer) {
        const canvas = getCanvas(renderer);
        if (!canvas) return 12;

        const rect = canvas.getBoundingClientRect();
        const nativeSize = getNativeSize(renderer);

        if (!rect.width) return 12;

        return 12 * (nativeSize[0] / rect.width);
    }

    function collectCandidates(target, bounds, renderer) {
        const xCandidates = [];
        const yCandidates = [];
        const sideCandidates = {
            left: null,
            right: null,
            top: null,
            bottom: null
        };
        const sideDeltas = {
            left: null,
            right: null,
            top: null,
            bottom: null
        };

        const snapDistance = getSnapDistance(renderer);
        const targets = window.vm?.runtime?.targets || [];

        for (const otherTarget of targets) {
            if (!otherTarget || otherTarget === target || otherTarget.isStage) continue;

            const otherDrawable = renderer._allDrawables[otherTarget.drawableID];
            if (!otherDrawable || otherDrawable._visible === false) continue;

            const otherBounds = otherDrawable.getAABB();

            const localX = [
                makeCandidate('x', 'left', 'left', 'left', otherBounds.left - bounds.left, otherBounds, otherTarget),
                makeCandidate('x', 'left', 'right', 'left', otherBounds.right - bounds.left, otherBounds, otherTarget),
                makeCandidate('x', 'right', 'left', 'right', otherBounds.left - bounds.right, otherBounds, otherTarget),
                makeCandidate('x', 'right', 'right', 'right', otherBounds.right - bounds.right, otherBounds, otherTarget)
            ];

            const localY = [
                makeCandidate('y', 'top', 'top', 'top', otherBounds.top - bounds.top, otherBounds, otherTarget),
                makeCandidate('y', 'top', 'bottom', 'top', otherBounds.bottom - bounds.top, otherBounds, otherTarget),
                makeCandidate('y', 'bottom', 'top', 'bottom', otherBounds.top - bounds.bottom, otherBounds, otherTarget),
                makeCandidate('y', 'bottom', 'bottom', 'bottom', otherBounds.bottom - bounds.bottom, otherBounds, otherTarget)
            ];

            for (const candidate of localX) {
                xCandidates.push(candidate);
                if (
                    Math.abs(candidate.delta) <= snapDistance &&
                    (
                        sideDeltas[candidate.side] === null ||
                        Math.abs(candidate.delta) < Math.abs(sideDeltas[candidate.side])
                    )
                ) {
                    sideDeltas[candidate.side] = candidate.delta;
                    sideCandidates[candidate.side] = otherBounds;
                }
            }

            for (const candidate of localY) {
                yCandidates.push(candidate);
                if (
                    Math.abs(candidate.delta) <= snapDistance &&
                    (
                        sideDeltas[candidate.side] === null ||
                        Math.abs(candidate.delta) < Math.abs(sideDeltas[candidate.side])
                    )
                ) {
                    sideDeltas[candidate.side] = candidate.delta;
                    sideCandidates[candidate.side] = otherBounds;
                }
            }
        }

        return {
            xCandidates,
            yCandidates,
            sideCandidates,
            snapDistance
        };
    }

    function findBestPair(xCandidates, yCandidates, snapDistance) {
        let bestPair = null;
        let bestScore = Infinity;

        for (const x of xCandidates) {
            if (Math.abs(x.delta) > snapDistance) continue;

            for (const y of yCandidates) {
                if (Math.abs(y.delta) > snapDistance) continue;
                if (x.otherTarget !== y.otherTarget) continue;

                const score = Math.hypot(x.delta, y.delta);

                if (score < bestScore) {
                    bestScore = score;
                    bestPair = { x, y };
                }
            }
        }

        return bestPair;
    }

    function notifyCornerPatch(xCandidate, yCandidate) {
        if (!window.TransforkCornerSnapPatch) return;

        window.TransforkCornerSnapPatch.setActiveCornerSnap(
            xCandidate ? xCandidate.targetEdge : null,
            yCandidate ? yCandidate.targetEdge : null
        );
    }

    function updateVisuals(target, sideCandidates, result) {
        if (!window.Transfork?.snapVisuals) return;

        window.Transfork.snapVisuals.update({
            target,
            candidates: sideCandidates,
            result
        });
    }

    function findSnapPosition(target, desiredX, desiredY) {
        const renderer = getRenderer();

        if (!target || !renderer || !renderer._allDrawables) {
            return { x: desiredX, y: desiredY };
        }

        const drawable = renderer._allDrawables[target.drawableID];

        if (!drawable) {
            return { x: desiredX, y: desiredY };
        }

        const currentBounds = drawable.getAABB();
        const bounds = offsetBounds(
            currentBounds,
            desiredX - target.x,
            desiredY - target.y
        );

        const data = collectCandidates(target, bounds, renderer);
        const pair = findBestPair(
            data.xCandidates,
            data.yCandidates,
            data.snapDistance
        );

        let xCandidate = null;
        let yCandidate = null;

        if (pair) {
            xCandidate = pair.x;
            yCandidate = pair.y;
        } else {
            xCandidate = pickBest(data.xCandidates, data.snapDistance);
            yCandidate = pickBest(data.yCandidates, data.snapDistance);
        }

        const result = {
            x: desiredX + (xCandidate ? xCandidate.delta : 0),
            y: desiredY + (yCandidate ? yCandidate.delta : 0)
        };

        notifyCornerPatch(xCandidate, yCandidate);
        updateVisuals(target, data.sideCandidates, result);

        return result;
    }

    window.Transfork.snapping = {
        findSnapPosition
    };

    console.log('[Transfork] snapping module loaded');
})();
