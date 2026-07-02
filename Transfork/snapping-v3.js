/*
Transfork/snapping-v3.js
Explicit edge-mode snapping engine for Transfork.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};

    const SNAP_PX = 12;
    const CORNER_FACTOR = 0.45;
    const SETTLE_LIMIT = 4;
    const ANCHOR_LIMIT = 6;

    let lastSnap = null;
    let snapAnchor = null;

    function renderer() {
        return window.Transfork?.geometry?.getRenderer()
            || window.vm?.renderer
            || window.vm?.runtime?.renderer
            || null;
    }

    function snapDistance(r) {
        const canvas = r?.canvas || document.querySelector('canvas');
        if (!canvas) return SNAP_PX;

        const rect = canvas.getBoundingClientRect();
        const native = typeof r.getNativeSize === 'function'
            ? r.getNativeSize()
            : [480, 360];

        return rect.width ? SNAP_PX * (native[0] / rect.width) : SNAP_PX;
    }

    function shift(bounds, dx, dy) {
        return {
            left: bounds.left + dx,
            right: bounds.right + dx,
            top: bounds.top + dy,
            bottom: bounds.bottom + dy
        };
    }

    function item(axis, activeEdge, otherEdge, delta, otherBounds, otherTarget) {
        return { axis, activeEdge, otherEdge, delta, otherBounds, otherTarget };
    }

    function best(list, limit) {
        let picked = null;

        for (const entry of list) {
            if (Math.abs(entry.delta) > limit) continue;
            if (!picked || Math.abs(entry.delta) < Math.abs(picked.delta)) {
                picked = entry;
            }
        }

        return picked;
    }

    function getFreshAABB(target, r) {
        const geometry = window.Transfork?.geometry?.getGeometry(
            target,
            { fresh: true }
        );

        if (geometry && geometry.aabb) return geometry.aabb;

        const drawable = r._allDrawables[target.drawableID];
        if (!drawable || typeof drawable.getAABB !== 'function') return null;

        return drawable.getAABB();
    }

    function collect(target, bounds, r, limit) {
        const horizontal = [];
        const vertical = [];
        const visual = { left: null, right: null, top: null, bottom: null };
        const visualDelta = { left: null, right: null, top: null, bottom: null };

        for (const other of window.vm?.runtime?.targets || []) {
            if (!other || other === target || other.isStage) continue;

            const b = getFreshAABB(other, r);
            if (!b) continue;

            const candidates = [
                item('x', 'left', 'left', b.left - bounds.left, b, other),
                item('x', 'left', 'right', b.right - bounds.left, b, other),
                item('x', 'right', 'left', b.left - bounds.right, b, other),
                item('x', 'right', 'right', b.right - bounds.right, b, other),
                item('y', 'top', 'top', b.top - bounds.top, b, other),
                item('y', 'top', 'bottom', b.bottom - bounds.top, b, other),
                item('y', 'bottom', 'top', b.top - bounds.bottom, b, other),
                item('y', 'bottom', 'bottom', b.bottom - bounds.bottom, b, other)
            ];

            for (const candidate of candidates) {
                if (candidate.axis === 'x') horizontal.push(candidate);
                else vertical.push(candidate);

                if (
                    Math.abs(candidate.delta) <= limit &&
                    (
                        visualDelta[candidate.activeEdge] === null ||
                        Math.abs(candidate.delta) < Math.abs(visualDelta[candidate.activeEdge])
                    )
                ) {
                    visualDelta[candidate.activeEdge] = candidate.delta;
                    visual[candidate.activeEdge] = candidate.otherBounds;
                }
            }
        }

        return { horizontal, vertical, visual };
    }

    function findCorner(horizontal, vertical, limit) {
        let picked = null;
        let score = Infinity;
        const cornerLimit = limit * CORNER_FACTOR;

        for (const x of horizontal) {
            if (Math.abs(x.delta) > cornerLimit) continue;

            for (const y of vertical) {
                if (Math.abs(y.delta) > cornerLimit) continue;
                if (x.otherTarget !== y.otherTarget) continue;

                const nextScore = Math.hypot(x.delta, y.delta);
                if (nextScore < score) {
                    score = nextScore;
                    picked = { x, y };
                }
            }
        }

        return picked;
    }

    function chooseSingleAxis(horizontal, vertical, limit) {
        const x = best(horizontal, limit);
        const y = best(vertical, limit);

        if (!x) return { x: null, y };
        if (!y) return { x, y: null };

        if (Math.abs(x.delta) <= Math.abs(y.delta)) {
            return { x, y: null };
        }

        return { x: null, y };
    }

    function notify(x, y) {
        window.TransforkCornerSnapPatch?.setActiveCornerSnap(
            x ? x.otherEdge : null,
            y ? y.otherEdge : null
        );
    }

    function draw(target, visual, result) {
        window.Transfork?.snapVisuals?.update({ target, candidates: visual, result });
    }

    function cloneBounds(bounds) {
        if (!bounds) return null;
        return {
            left: bounds.left,
            right: bounds.right,
            top: bounds.top,
            bottom: bounds.bottom
        };
    }

    function pickAnchorCandidate(x, y) {
        if (x && !y) return x;
        if (y && !x) return y;
        if (!x && !y) return null;
        return Math.abs(x.delta) <= Math.abs(y.delta) ? x : y;
    }

    function makeAnchor(target, snap) {
        if (!snap) return null;
        return {
            target,
            axis: snap.axis,
            activeEdge: snap.activeEdge,
            otherEdge: snap.otherEdge,
            otherTarget: snap.otherTarget,
            otherBounds: cloneBounds(snap.otherBounds),
            time: Date.now()
        };
    }

    function sameBounds(a, b) {
        if (!a || !b) return false;
        return (
            Math.abs(a.left - b.left) <= ANCHOR_LIMIT &&
            Math.abs(a.right - b.right) <= ANCHOR_LIMIT &&
            Math.abs(a.top - b.top) <= ANCHOR_LIMIT &&
            Math.abs(a.bottom - b.bottom) <= ANCHOR_LIMIT
        );
    }

    function anchorIsValid(anchor, r) {
        if (!anchor || !anchor.otherTarget) return false;
        const currentOther = getFreshAABB(anchor.otherTarget, r);
        return sameBounds(anchor.otherBounds, currentOther);
    }

    function correctionFromSnap(bounds, snap, limit) {
        if (!snap) return 0;
        const delta = snap.otherBounds[snap.otherEdge] - bounds[snap.activeEdge];
        return Math.abs(delta) <= limit ? delta : 0;
    }

    function applyAxisCorrection(result, currentAABB, target, snap, limit) {
        if (!snap) return;

        const proposed = shift(
            currentAABB,
            result.x - target.x,
            result.y - target.y
        );

        const delta = correctionFromSnap(proposed, snap, limit);
        if (!delta) return;

        if (snap.axis === 'x') result.x += delta;
        else result.y += delta;
    }

    function rememberSnap(target, x, y) {
        lastSnap = {
            target,
            x,
            y,
            time: Date.now()
        };
    }

    function settleAxis(bounds, snap) {
        return correctionFromSnap(bounds, snap, SETTLE_LIMIT);
    }

    function settleAnchor(target, r, bounds) {
        if (!snapAnchor || snapAnchor.target !== target) return null;
        if (!anchorIsValid(snapAnchor, r)) return null;

        const delta = correctionFromSnap(bounds, snapAnchor, ANCHOR_LIMIT);
        if (!delta) return null;

        return snapAnchor.axis === 'x'
            ? { dx: delta, dy: 0 }
            : { dx: 0, dy: delta };
    }

    function settleSnap(target) {
        const r = renderer();
        if (!target || !r?._allDrawables || !lastSnap) return false;
        if (lastSnap.target !== target) return false;
        if (Date.now() - lastSnap.time > 1200) return false;

        const bounds = getFreshAABB(target, r);
        if (!bounds) return false;

        const anchorMove = settleAnchor(target, r, bounds) || { dx: 0, dy: 0 };
        const afterAnchor = shift(bounds, anchorMove.dx, anchorMove.dy);
        const dx = anchorMove.dx + settleAxis(afterAnchor, lastSnap.x);
        const dy = anchorMove.dy + settleAxis(afterAnchor, lastSnap.y);

        snapAnchor = null;

        if (!dx && !dy) return false;

        target.setXY(target.x + dx, target.y + dy);
        target.emitVisualChange();
        window.vm?.runtime?.requestRedraw();
        window.Transfork?.geometry?.clear(target);
        return true;
    }

    function findSnapPosition(target, desiredX, desiredY) {
        const r = renderer();
        if (!target || !r?._allDrawables) return { x: desiredX, y: desiredY };

        const currentAABB = getFreshAABB(target, r);
        if (!currentAABB) return { x: desiredX, y: desiredY };

        const bounds = shift(
            currentAABB,
            desiredX - target.x,
            desiredY - target.y
        );

        const limit = snapDistance(r);
        const data = collect(target, bounds, r, limit);
        const corner = findCorner(data.horizontal, data.vertical, limit);

        let x = null;
        let y = null;

        if (corner) {
            x = corner.x;
            y = corner.y;
        } else {
            const axis = chooseSingleAxis(data.horizontal, data.vertical, limit);
            x = axis.x;
            y = axis.y;
        }

        if (!x && !y) {
            snapAnchor = null;
        }

        if ((x || y) && (!snapAnchor || snapAnchor.target !== target)) {
            snapAnchor = makeAnchor(target, pickAnchorCandidate(x, y));
        }

        const result = {
            x: desiredX + (x ? x.delta : 0),
            y: desiredY + (y ? y.delta : 0)
        };

        if (snapAnchor && snapAnchor.target === target && anchorIsValid(snapAnchor, r)) {
            applyAxisCorrection(result, currentAABB, target, snapAnchor, ANCHOR_LIMIT);
        }

        rememberSnap(target, x, y);
        notify(x, y);
        draw(target, data.visual, result);
        return result;
    }

    window.Transfork.snapping = {
        findSnapPosition,
        settleSnap
    };

    console.log('[Transfork] snapping v3 explicit edge modes loaded');
})();
