/*
Transfork/snapping-v2.js
Small replacement for snapping.js with stricter side/corner separation.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};

    function renderer() {
        return window.vm?.renderer || window.vm?.runtime?.renderer || null;
    }

    function snapDistance(r) {
        const canvas = r?.canvas || document.querySelector('canvas');
        if (!canvas) return 12;
        const rect = canvas.getBoundingClientRect();
        const native = typeof r.getNativeSize === 'function'
            ? r.getNativeSize()
            : [480, 360];
        return rect.width ? 12 * (native[0] / rect.width) : 12;
    }

    function shifted(bounds, dx, dy) {
        return {
            left: bounds.left + dx,
            right: bounds.right + dx,
            top: bounds.top + dy,
            bottom: bounds.bottom + dy
        };
    }

    function candidate(axis, side, sourceEdge, targetEdge, delta, otherBounds, otherTarget) {
        return { axis, side, sourceEdge, targetEdge, delta, otherBounds, otherTarget };
    }

    function best(list, limit) {
        let found = null;
        for (const item of list) {
            if (Math.abs(item.delta) > limit) continue;
            if (!found || Math.abs(item.delta) < Math.abs(found.delta)) {
                found = item;
            }
        }
        return found;
    }

    function bestPreferredTop(list, limit) {
        const directTop = best(
            list.filter(item => item.side === 'top' && item.sourceEdge === 'top'),
            limit
        );

        if (directTop) return directTop;

        return best(list, limit);
    }

    function collect(target, bounds, r, limit) {
        const xs = [];
        const ys = [];
        const visual = { left: null, right: null, top: null, bottom: null };
        const visualDelta = { left: null, right: null, top: null, bottom: null };

        for (const other of window.vm?.runtime?.targets || []) {
            if (!other || other === target || other.isStage) continue;
            const d = r._allDrawables[other.drawableID];
            if (!d || d._visible === false) continue;

            const b = d.getAABB();
            const local = [
                candidate('x', 'left', 'left', 'left', b.left - bounds.left, b, other),
                candidate('x', 'left', 'right', 'left', b.right - bounds.left, b, other),
                candidate('x', 'right', 'left', 'right', b.left - bounds.right, b, other),
                candidate('x', 'right', 'right', 'right', b.right - bounds.right, b, other),
                candidate('y', 'top', 'top', 'top', b.top - bounds.top, b, other),
                candidate('y', 'top', 'bottom', 'top', b.bottom - bounds.top, b, other),
                candidate('y', 'bottom', 'top', 'bottom', b.top - bounds.bottom, b, other),
                candidate('y', 'bottom', 'bottom', 'bottom', b.bottom - bounds.bottom, b, other)
            ];

            for (const item of local) {
                if (item.axis === 'x') xs.push(item);
                else ys.push(item);

                if (
                    Math.abs(item.delta) <= limit &&
                    (
                        visualDelta[item.side] === null ||
                        Math.abs(item.delta) < Math.abs(visualDelta[item.side])
                    )
                ) {
                    visualDelta[item.side] = item.delta;
                    visual[item.side] = item.otherBounds;
                }
            }
        }

        return { xs, ys, visual };
    }

    function cornerPair(xs, ys, limit) {
        let pair = null;
        let score = Infinity;
        const cornerLimit = limit * 0.45;

        for (const x of xs) {
            if (Math.abs(x.delta) > cornerLimit) continue;
            for (const y of ys) {
                if (Math.abs(y.delta) > cornerLimit) continue;
                if (x.otherTarget !== y.otherTarget) continue;
                const s = Math.hypot(x.delta, y.delta);
                if (s < score) {
                    score = s;
                    pair = { x, y };
                }
            }
        }

        return pair;
    }

    function setCorner(x, y) {
        if (!window.TransforkCornerSnapPatch) return;
        window.TransforkCornerSnapPatch.setActiveCornerSnap(
            x ? x.targetEdge : null,
            y ? y.targetEdge : null
        );
    }

    function draw(target, visual, result) {
        window.Transfork?.snapVisuals?.update({
            target,
            candidates: visual,
            result
        });
    }

    function findSnapPosition(target, desiredX, desiredY) {
        const r = renderer();
        if (!target || !r?._allDrawables) return { x: desiredX, y: desiredY };

        const d = r._allDrawables[target.drawableID];
        if (!d) return { x: desiredX, y: desiredY };

        const bounds = shifted(
            d.getAABB(),
            desiredX - target.x,
            desiredY - target.y
        );

        const limit = snapDistance(r);
        const data = collect(target, bounds, r, limit);
        const pair = cornerPair(data.xs, data.ys, limit);

        let x = null;
        let y = null;

        if (pair) {
            x = pair.x;
            y = pair.y;
        } else {
            x = best(data.xs, limit);
            y = bestPreferredTop(data.ys, limit);

            if (x && y) {
                if (Math.abs(x.delta) <= Math.abs(y.delta)) {
                    y = null;
                } else {
                    x = null;
                }
            }
        }

        const result = {
            x: desiredX + (x ? x.delta : 0),
            y: desiredY + (y ? y.delta : 0)
        };

        setCorner(x, y);
        draw(target, data.visual, result);
        return result;
    }

    window.Transfork.snapping = { findSnapPosition };
    console.log('[Transfork] snapping v2 loaded');
})();
