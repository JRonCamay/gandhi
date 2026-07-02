/*
Transfork/geometry.js
Single geometry source of truth for Transfork.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};

    const cache = new WeakMap();
    let frameId = 0;

    function markFrame() {
        frameId += 1;
        requestAnimationFrame(markFrame);
    }

    requestAnimationFrame(markFrame);

    function getVM() {
        return window.vm || null;
    }

    function getRenderer() {
        const vm = getVM();
        if (!vm) return null;
        return vm.renderer || vm.runtime?.renderer || null;
    }

    function getCanvas() {
        const renderer = getRenderer();
        return renderer?.canvas || null;
    }

    function getCanvasRect() {
        const canvas = getCanvas();
        return canvas ? canvas.getBoundingClientRect() : null;
    }

    function getNativeSize() {
        const renderer = getRenderer();
        if (renderer && typeof renderer.getNativeSize === 'function') {
            return renderer.getNativeSize();
        }
        return [480, 360];
    }

    function getDrawable(target) {
        if (!target) return null;
        const renderer = getRenderer();
        if (!renderer || !renderer._allDrawables) return null;
        return renderer._allDrawables[target.drawableID] || null;
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

    function getAABB(target) {
        const drawable = getDrawable(target);
        if (!drawable || typeof drawable.getAABB !== 'function') return null;
        return cloneAABB(drawable.getAABB());
    }

    function getSizeFromAABB(aabb) {
        if (!aabb) return null;
        return {
            width: aabb.right - aabb.left,
            height: aabb.top - aabb.bottom
        };
    }

    function getCenterFromAABB(aabb) {
        if (!aabb) return null;
        return {
            x: (aabb.left + aabb.right) / 2,
            y: (aabb.top + aabb.bottom) / 2
        };
    }

    function getCornersFromAABB(aabb) {
        if (!aabb) return null;
        return {
            topLeft: { x: aabb.left, y: aabb.top },
            topRight: { x: aabb.right, y: aabb.top },
            bottomLeft: { x: aabb.left, y: aabb.bottom },
            bottomRight: { x: aabb.right, y: aabb.bottom }
        };
    }

    function worldToScreen(x, y) {
        const rect = getCanvasRect();
        const nativeSize = getNativeSize();
        if (!rect) return null;
        return {
            x: ((x + nativeSize[0] / 2) / nativeSize[0]) * rect.width,
            y: ((nativeSize[1] / 2 - y) / nativeSize[1]) * rect.height
        };
    }

    function screenToWorld(x, y) {
        const rect = getCanvasRect();
        const nativeSize = getNativeSize();
        if (!rect) return null;
        return {
            x: (x / rect.width) * nativeSize[0] - nativeSize[0] / 2,
            y: nativeSize[1] / 2 - (y / rect.height) * nativeSize[1]
        };
    }

    function aabbToScreen(aabb) {
        if (!aabb) return null;
        const topLeft = worldToScreen(aabb.left, aabb.top);
        const bottomRight = worldToScreen(aabb.right, aabb.bottom);
        if (!topLeft || !bottomRight) return null;
        return {
            left: topLeft.x,
            top: topLeft.y,
            right: bottomRight.x,
            bottom: bottomRight.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };
    }

    function getTargetState(target) {
        if (!target) return null;
        return {
            x: target.x,
            y: target.y,
            direction: target.direction,
            size: target.size,
            drawableID: target.drawableID
        };
    }

    function getGeometry(target) {
        if (!target) return null;

        const existing = cache.get(target);
        if (existing && existing.frameId === frameId) {
            return existing.geometry;
        }

        const aabb = getAABB(target);
        const geometry = {
            target,
            drawable: getDrawable(target),
            aabb,
            screenAABB: aabbToScreen(aabb),
            center: getCenterFromAABB(aabb),
            corners: getCornersFromAABB(aabb),
            size: getSizeFromAABB(aabb),
            state: getTargetState(target),
            renderer: getRenderer(),
            canvas: getCanvas(),
            canvasRect: getCanvasRect(),
            nativeSize: getNativeSize()
        };

        cache.set(target, {
            frameId,
            geometry
        });

        return geometry;
    }

    function clear(target) {
        if (target) {
            cache.delete(target);
            return;
        }
        frameId += 1;
    }

    window.Transfork.geometry = {
        getVM,
        getRenderer,
        getCanvas,
        getCanvasRect,
        getNativeSize,
        getDrawable,
        getAABB,
        getGeometry,
        getCenterFromAABB,
        getCornersFromAABB,
        getSizeFromAABB,
        worldToScreen,
        screenToWorld,
        aabbToScreen,
        clear
    };

    console.log('[Transfork] geometry engine loaded');
})();
