/*
Transfork/engine/state.js
Shared O(1) state core for the Transfork transform engine.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};
    window.Transfork.engine = window.Transfork.engine || {};

    const listeners = new Map();

    let state = makeInitialState();

    function makeInitialState() {
        return {
            initialized: false,
            active: false,
            target: null,
            targetId: null,
            drawableId: null,
            spriteName: '',
            frame: 0,
            revision: 0,
            startedAt: 0,
            updatedAt: 0,
            dirty: {
                target: true,
                transform: true,
                geometry: true,
                snap: true,
                render: true
            },
            transform: makeTransform(),
            startTransform: null,
            previousTransform: null,
            geometry: {
                aabb: null,
                center: null,
                corners: null,
                screenBounds: null,
                revision: -1
            },
            snap: {
                x: null,
                y: null,
                anchor: null,
                candidates: null,
                result: null,
                revision: -1
            },
            renderer: {
                overlay: null,
                handles: null,
                guides: null,
                tooltip: null,
                revision: -1
            },
            cache: Object.create(null),
            meta: Object.create(null)
        };
    }

    function makeTransform(values) {
        values = values || {};
        return {
            x: numberOr(values.x, 0),
            y: numberOr(values.y, 0),
            direction: numberOr(values.direction, 90),
            size: numberOr(values.size, 100),
            scaleX: numberOr(values.scaleX, 100),
            scaleY: numberOr(values.scaleY, 100),
            skewX: numberOr(values.skewX, 0),
            skewY: numberOr(values.skewY, 0)
        };
    }

    function numberOr(value, fallback) {
        return typeof value === 'number' && Number.isFinite(value)
            ? value
            : fallback;
    }

    function now() {
        return Date.now();
    }

    function clonePoint(point) {
        return point ? { x: point.x, y: point.y } : null;
    }

    function cloneAABB(aabb) {
        return aabb ? {
            left: aabb.left,
            right: aabb.right,
            top: aabb.top,
            bottom: aabb.bottom
        } : null;
    }

    function cloneTransform(transform) {
        return transform ? makeTransform(transform) : null;
    }

    function cloneCorners(corners) {
        return corners ? {
            topLeft: clonePoint(corners.topLeft),
            topRight: clonePoint(corners.topRight),
            bottomLeft: clonePoint(corners.bottomLeft),
            bottomRight: clonePoint(corners.bottomRight)
        } : null;
    }

    function readTargetTransform(target) {
        return makeTransform({
            x: target?.x,
            y: target?.y,
            direction: target?.direction,
            size: target?.size,
            scaleX: target?.scale?.[0],
            scaleY: target?.scale?.[1],
            skewX: target?.__transforkSkewX,
            skewY: target?.__transforkSkewY
        });
    }

    function emit(type) {
        const set = listeners.get(type);
        if (!set) return;

        const snapshot = getSnapshot();
        for (const callback of Array.from(set)) {
            try {
                callback(snapshot);
            } catch (error) {
                console.error('[Transfork state listener]', error);
            }
        }
    }

    function setDirty(keys, value) {
        const list = Array.isArray(keys) ? keys : [keys];
        for (const key of list) {
            if (key in state.dirty) state.dirty[key] = value;
        }
    }

    function touch(keys) {
        setDirty(keys, true);
        state.revision += 1;
        state.updatedAt = now();
    }

    function init() {
        if (state.initialized) return true;
        state.initialized = true;
        state.startedAt = now();
        state.updatedAt = state.startedAt;
        emit('init');
        return true;
    }

    function begin(target, meta) {
        if (!target || target.isStage) return false;

        init();

        const transform = readTargetTransform(target);
        state.active = true;
        state.target = target;
        state.targetId = target.id || null;
        state.drawableId = target.drawableID || null;
        state.spriteName = target.sprite?.name || '';
        state.transform = cloneTransform(transform);
        state.startTransform = cloneTransform(transform);
        state.previousTransform = cloneTransform(transform);
        state.meta = Object.assign(Object.create(null), meta || {});
        state.frame = 0;
        touch(['target', 'transform', 'geometry', 'snap', 'render']);
        emit('begin');
        return true;
    }

    function updateTransform(values) {
        if (!state.active || !values) return false;

        state.previousTransform = cloneTransform(state.transform);

        if (typeof values.x === 'number') state.transform.x = values.x;
        if (typeof values.y === 'number') state.transform.y = values.y;
        if (typeof values.direction === 'number') state.transform.direction = values.direction;
        if (typeof values.size === 'number') state.transform.size = values.size;
        if (typeof values.scaleX === 'number') state.transform.scaleX = values.scaleX;
        if (typeof values.scaleY === 'number') state.transform.scaleY = values.scaleY;
        if (typeof values.skewX === 'number') state.transform.skewX = values.skewX;
        if (typeof values.skewY === 'number') state.transform.skewY = values.skewY;

        touch(['transform', 'geometry', 'snap', 'render']);
        emit('transform');
        return true;
    }

    function setGeometry(geometry) {
        state.geometry.aabb = cloneAABB(geometry?.aabb);
        state.geometry.center = clonePoint(geometry?.center);
        state.geometry.corners = cloneCorners(geometry?.corners);
        state.geometry.screenBounds = geometry?.screenBounds
            ? Object.assign({}, geometry.screenBounds)
            : null;
        state.geometry.revision = state.revision;
        setDirty('geometry', false);
        touch('render');
        emit('geometry');
    }

    function setSnap(snap) {
        state.snap.x = snap?.x || null;
        state.snap.y = snap?.y || null;
        state.snap.anchor = snap?.anchor || null;
        state.snap.candidates = snap?.candidates || null;
        state.snap.result = snap?.result || null;
        state.snap.revision = state.revision;
        setDirty('snap', false);
        touch('render');
        emit('snap');
    }

    function end() {
        if (!state.active) return null;
        const snapshot = getSnapshot();
        state = makeInitialState();
        state.initialized = true;
        emit('end');
        return snapshot;
    }

    function cancel() {
        if (!state.active) return false;
        state = makeInitialState();
        state.initialized = true;
        emit('cancel');
        return true;
    }

    function tick() {
        state.frame += 1;
        return state.frame;
    }

    function isActive(target) {
        if (!state.active) return false;
        if (!target) return true;
        return state.target === target || state.targetId === target.id;
    }

    function setCache(key, value) {
        state.cache[key] = value;
    }

    function getCache(key) {
        return state.cache[key];
    }

    function clearCache(key) {
        if (typeof key === 'string') delete state.cache[key];
        else state.cache = Object.create(null);
    }

    function getSnapshot() {
        return {
            initialized: state.initialized,
            active: state.active,
            target: state.target,
            targetId: state.targetId,
            drawableId: state.drawableId,
            spriteName: state.spriteName,
            frame: state.frame,
            revision: state.revision,
            startedAt: state.startedAt,
            updatedAt: state.updatedAt,
            dirty: Object.assign({}, state.dirty),
            transform: cloneTransform(state.transform),
            startTransform: cloneTransform(state.startTransform),
            previousTransform: cloneTransform(state.previousTransform),
            geometry: {
                aabb: cloneAABB(state.geometry.aabb),
                center: clonePoint(state.geometry.center),
                corners: cloneCorners(state.geometry.corners),
                screenBounds: state.geometry.screenBounds
                    ? Object.assign({}, state.geometry.screenBounds)
                    : null,
                revision: state.geometry.revision
            },
            snap: {
                x: state.snap.x,
                y: state.snap.y,
                anchor: state.snap.anchor,
                candidates: state.snap.candidates,
                result: state.snap.result,
                revision: state.snap.revision
            },
            meta: Object.assign({}, state.meta)
        };
    }

    function on(type, callback) {
        if (!listeners.has(type)) listeners.set(type, new Set());
        listeners.get(type).add(callback);
        return function off() {
            listeners.get(type)?.delete(callback);
        };
    }

    function dispose() {
        listeners.clear();
        state = makeInitialState();
    }

    window.Transfork.engine.state = {
        init,
        begin,
        updateTransform,
        setGeometry,
        setSnap,
        end,
        cancel,
        tick,
        isActive,
        setCache,
        getCache,
        clearCache,
        getSnapshot,
        on,
        dispose
    };

    console.log('[Transfork engine] state loaded');
})();
