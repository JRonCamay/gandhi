/*
Transfork/engine/simulation.js
Reusable live transform simulation state for Transfork.

Rule:
- VM is the final commit target.
- Simulation is the live editing state.
- This module does not know DOM, snapping, overlay, or rendering.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};
    window.Transfork.engine = window.Transfork.engine || {};

    const listeners = new Map();

    const state = {
        active: false,
        target: null,
        targetId: null,
        spriteName: '',

        start: null,
        current: null,
        previous: null,

        dirty: false,
        startedAt: 0,
        updatedAt: 0,
        revision: 0,

        meta: {}
    };

    function now() {
        return Date.now();
    }

    function clonePoint(point) {
        if (!point) return null;
        return {
            x: point.x,
            y: point.y
        };
    }

    function cloneAABB(aabb) {
        if (!aabb) return null;
        return {
            left: aabb.left,
            right: aabb.right,
            top: aabb.top,
            bottom: aabb.bottom
        };
    }

    function makeAABB(center, size) {
        if (!center || !size) return null;

        const halfWidth = size.width / 2;
        const halfHeight = size.height / 2;

        return {
            left: center.x - halfWidth,
            right: center.x + halfWidth,
            top: center.y + halfHeight,
            bottom: center.y - halfHeight
        };
    }

    function makeCorners(aabb) {
        if (!aabb) return null;

        return {
            topLeft: { x: aabb.left, y: aabb.top },
            topRight: { x: aabb.right, y: aabb.top },
            bottomLeft: { x: aabb.left, y: aabb.bottom },
            bottomRight: { x: aabb.right, y: aabb.bottom }
        };
    }

    function makeSize(aabb) {
        if (!aabb) return null;

        return {
            width: aabb.right - aabb.left,
            height: aabb.top - aabb.bottom
        };
    }

    function makeCenter(aabb, fallback) {
        if (!aabb) return clonePoint(fallback);

        return {
            x: (aabb.left + aabb.right) / 2,
            y: (aabb.top + aabb.bottom) / 2
        };
    }

    function cloneTransform(transform) {
        if (!transform) return null;

        return {
            x: transform.x,
            y: transform.y,
            direction: transform.direction,
            size: transform.size,
            scaleX: transform.scaleX,
            scaleY: transform.scaleY,
            skewX: transform.skewX,
            skewY: transform.skewY,
            aabb: cloneAABB(transform.aabb),
            center: clonePoint(transform.center),
            corners: transform.corners ? {
                topLeft: clonePoint(transform.corners.topLeft),
                topRight: clonePoint(transform.corners.topRight),
                bottomLeft: clonePoint(transform.corners.bottomLeft),
                bottomRight: clonePoint(transform.corners.bottomRight)
            } : null,
            boundsSize: transform.boundsSize ? {
                width: transform.boundsSize.width,
                height: transform.boundsSize.height
            } : null
        };
    }

    function getDrawable(target) {
        const renderer =
            window.Transfork?.geometry?.getRenderer?.() ||
            window.vm?.renderer ||
            window.vm?.runtime?.renderer ||
            null;

        if (!target || !renderer || !renderer._allDrawables) {
            return null;
        }

        return renderer._allDrawables[target.drawableID] || null;
    }

    function getTargetAABB(target) {
        const drawable = getDrawable(target);

        if (!drawable || typeof drawable.getAABB !== 'function') {
            return null;
        }

        return cloneAABB(drawable.getAABB());
    }

    function readTargetTransform(target) {
        const aabb = getTargetAABB(target);
        const center = makeCenter(aabb, { x: target.x, y: target.y });
        const boundsSize = makeSize(aabb) || { width: 0, height: 0 };

        return {
            x: target.x,
            y: target.y,
            direction: target.direction || 0,
            size: target.size || 100,
            scaleX: target.scale?.[0] || 100,
            scaleY: target.scale?.[1] || 100,
            skewX: 0,
            skewY: 0,
            aabb,
            center,
            corners: makeCorners(aabb),
            boundsSize
        };
    }

    function rebuildVirtualGeometry() {
        if (!state.current) return;

        const baseSize =
            state.start?.boundsSize ||
            state.current.boundsSize ||
            { width: 0, height: 0 };

        const center = {
            x: state.current.x,
            y: state.current.y
        };

        const aabb = makeAABB(center, baseSize);

        state.current.center = center;
        state.current.aabb = aabb;
        state.current.corners = makeCorners(aabb);
        state.current.boundsSize = {
            width: baseSize.width,
            height: baseSize.height
        };
    }

    function emit(type, payload) {
        const set = listeners.get(type);
        if (!set) return;

        for (const callback of Array.from(set)) {
            try {
                callback(payload);
            } catch (error) {
                console.error('[Transfork simulation listener]', error);
            }
        }
    }

    function touch() {
        state.dirty = true;
        state.updatedAt = now();
        state.revision += 1;
    }

    function begin(target, meta) {
        if (!target || target.isStage) return false;

        const transform = readTargetTransform(target);

        state.active = true;
        state.target = target;
        state.targetId = target.id || null;
        state.spriteName = target.sprite?.name || '';
        state.start = cloneTransform(transform);
        state.current = cloneTransform(transform);
        state.previous = cloneTransform(transform);
        state.dirty = false;
        state.startedAt = now();
        state.updatedAt = state.startedAt;
        state.revision = 0;
        state.meta = Object.assign({}, meta || {});

        emit('begin', getSnapshot());
        return true;
    }

    function update(values) {
        if (!state.active || !state.current) return false;

        state.previous = cloneTransform(state.current);

        if (typeof values?.x === 'number') state.current.x = values.x;
        if (typeof values?.y === 'number') state.current.y = values.y;
        if (typeof values?.direction === 'number') state.current.direction = values.direction;
        if (typeof values?.size === 'number') state.current.size = values.size;
        if (typeof values?.scaleX === 'number') state.current.scaleX = values.scaleX;
        if (typeof values?.scaleY === 'number') state.current.scaleY = values.scaleY;
        if (typeof values?.skewX === 'number') state.current.skewX = values.skewX;
        if (typeof values?.skewY === 'number') state.current.skewY = values.skewY;

        rebuildVirtualGeometry();
        touch();
        emit('update', getSnapshot());
        return true;
    }

    function moveTo(x, y) {
        return update({ x, y });
    }

    function moveBy(dx, dy) {
        if (!state.active || !state.current) return false;
        return moveTo(state.current.x + dx, state.current.y + dy);
    }

    function setRotation(direction) {
        return update({ direction });
    }

    function setScale(scaleX, scaleY) {
        return update({ scaleX, scaleY });
    }

    function setSkew(skewX, skewY) {
        return update({ skewX, skewY });
    }

    function cancel() {
        if (!state.active) return false;

        const snapshot = getSnapshot();

        state.active = false;
        state.target = null;
        state.targetId = null;
        state.spriteName = '';
        state.start = null;
        state.current = null;
        state.previous = null;
        state.dirty = false;
        state.meta = {};

        emit('cancel', snapshot);
        return true;
    }

    function end() {
        if (!state.active) return null;

        const snapshot = getSnapshot();

        state.active = false;
        state.target = null;
        state.targetId = null;
        state.spriteName = '';
        state.start = null;
        state.current = null;
        state.previous = null;
        state.dirty = false;
        state.meta = {};

        emit('end', snapshot);
        return snapshot;
    }

    function getSnapshot() {
        return {
            active: state.active,
            target: state.target,
            targetId: state.targetId,
            spriteName: state.spriteName,
            start: cloneTransform(state.start),
            current: cloneTransform(state.current),
            previous: cloneTransform(state.previous),
            dirty: state.dirty,
            startedAt: state.startedAt,
            updatedAt: state.updatedAt,
            revision: state.revision,
            meta: Object.assign({}, state.meta)
        };
    }

    function getCurrent() {
        return cloneTransform(state.current);
    }

    function getAABB() {
        return cloneAABB(state.current?.aabb);
    }

    function isActive(target) {
        if (!state.active) return false;
        if (!target) return true;
        return state.target === target || state.targetId === target.id;
    }

    function on(type, callback) {
        if (!listeners.has(type)) {
            listeners.set(type, new Set());
        }

        listeners.get(type).add(callback);

        return function off() {
            listeners.get(type)?.delete(callback);
        };
    }

    window.Transfork.engine.simulation = {
        begin,
        update,
        moveTo,
        moveBy,
        setRotation,
        setScale,
        setSkew,
        cancel,
        end,
        getSnapshot,
        getCurrent,
        getAABB,
        isActive,
        on
    };

    console.log('[Transfork engine] simulation loaded');
})();
