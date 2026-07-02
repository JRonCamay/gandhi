/*
Transfork/snapping-v3.js
Explicit edge-mode snapping engine for Transfork.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};

    const SNAP_PX = 12;
    const CORNER_FACTOR = 0.45;

    function renderer() {
        return window.vm?.renderer || window.vm?.runtime?.renderer || null;
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

    function collect(target, bounds, r, limit) {
        const horizontal = [];
        const vertical = [];
        const visual = { left: null, right: null, top: null, bottom: null };
        const visualDelta = { left: null, right: null, top: null, bottom: null };

        for (const other of window.vm?.runtime?.targets || []) {
            if (!other || other === target || other.isStage) continue;

            const drawable = r._allDrawables[other.drawableID];
            if (!drawable || drawable._visible === false) continue;

            const b = drawable.getAABB();
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

    function findSnapPosition(target, desiredX, desiredY) {
        const r = renderer();
        if (!target || !r?._allDrawables) return { x: desiredX, y: desiredY };

        const drawable = r._allDrawables[target.drawableID];
        if (!drawable) return { x: desiredX, y: desiredY };

        const bounds = shift(
            drawable.getAABB(),
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

        const result = {
            x: desiredX + (x ? x.delta : 0),
            y: desiredY + (y ? y.delta : 0)
        };

        notify(x, y);
        draw(target, data.visual, result);
        return result;
    }

    window.Transfork.snapping = { findSnapPosition };
    console.log('[Transfork] snapping v3 explicit edge modes loaded');
})();
