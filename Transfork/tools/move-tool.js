/*
Transfork/tools/move-tool.js
Move interaction module for Transfork.

Scope:
- Owns move-drag calculations only.
- No DOM creation.
- No direct overlay rendering.
- Uses engine transform when available.
- Falls back to target.setXY for legacy compatibility.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};
    window.Transfork.tools = window.Transfork.tools || {};

    function makeState() {
        return {
            active: false,
            target: null,
            source: '',
            startMouseX: 0,
            startMouseY: 0,
            startX: 0,
            startY: 0,
            lastX: null,
            lastY: null,
            canvas: null,
            renderer: null,
            cleanup: []
        };
    }

    let state = makeState();

    function getRenderer() {
        return window.Transfork?.geometry?.getRenderer?.() ||
            window.vm?.renderer ||
            window.vm?.runtime?.renderer ||
            null;
    }

    function getCanvas(context) {
        if (context?.canvas) return context.canvas;

        const renderer = getRenderer();
        if (renderer?.canvas) return renderer.canvas;

        return document.querySelector('canvas');
    }

    function getNativeSize(renderer) {
        if (renderer && typeof renderer.getNativeSize === 'function') {
            return renderer.getNativeSize();
        }

        return [480, 360];
    }

    function getTarget(context) {
        return context?.target || window.vm?.editingTarget || null;
    }

    function getSnapSolver(context) {
        if (typeof context?.findSnapPosition === 'function') {
            return context.findSnapPosition;
        }

        if (window.Transfork?.snapping?.findSnapPosition) {
            return window.Transfork.snapping.findSnapPosition;
        }

        if (typeof window.findSnapPosition === 'function') {
            return window.findSnapPosition;
        }

        return null;
    }

    function requestRedraw(target) {
        if (target && typeof target.emitVisualChange === 'function') {
            target.emitVisualChange();
        }

        const runtime = window.vm?.runtime;
        if (runtime && typeof runtime.requestRedraw === 'function') {
            runtime.requestRedraw();
        }
    }

    function begin(event, context) {
        const target = getTarget(context);
        if (!target || target.isStage) return false;

        const renderer = getRenderer();
        const canvas = getCanvas(context);
        if (!canvas || !renderer) return false;

        state.active = true;
        state.target = target;
        state.source = context?.source || 'move';
        state.startMouseX = event.clientX;
        state.startMouseY = event.clientY;
        state.startX = target.x;
        state.startY = target.y;
        state.lastX = target.x;
        state.lastY = target.y;
        state.canvas = canvas;
        state.renderer = renderer;

        if (window.Transfork?.engine?.transform) {
            window.Transfork.engine.transform.begin(
                target,
                { source: state.source }
            );
        }

        return true;
    }

    function getDesiredPosition(event) {
        const rect = state.canvas.getBoundingClientRect();
        const native = getNativeSize(state.renderer);
        const width = native[0] || 480;
        const height = native[1] || 360;

        const dx = ((event.clientX - state.startMouseX) / rect.width) * width;
        const dy = ((event.clientY - state.startMouseY) / rect.height) * height;

        return {
            x: state.startX + dx,
            y: state.startY - dy
        };
    }

    function solveSnap(desired, context) {
        const solver = getSnapSolver(context);
        if (!solver) return desired;

        return solver(
            state.target,
            desired.x,
            desired.y
        );
    }

    function applyPosition(position) {
        if (
            position.x === state.lastX &&
            position.y === state.lastY
        ) {
            return;
        }

        state.lastX = position.x;
        state.lastY = position.y;

        if (
            window.Transfork?.engine?.transform?.isActive(
                state.target
            )
        ) {
            window.Transfork.engine.transform.update({
                x: position.x,
                y: position.y
            });
            return;
        }

        state.target.setXY(position.x, position.y);
        requestRedraw(state.target);
    }

    function update(event, context) {
        if (!state.active || !state.target) return false;
        if (!state.canvas || !state.renderer) return false;

        const desired = getDesiredPosition(event);
        const snapped = solveSnap(desired, context);

        applyPosition(snapped);
        return true;
    }

    function commit() {
        if (!state.active) return null;

        let result = null;

        if (
            window.Transfork?.engine?.transform?.isActive(
                state.target
            )
        ) {
            result = window.Transfork.engine.transform.commit();
        }
        else if (state.target) {
            requestRedraw(state.target);
            result = {
                target: state.target,
                x: state.lastX,
                y: state.lastY
            };
        }

        reset();
        return result;
    }

    function cancel() {
        if (!state.active) return false;

        if (
            window.Transfork?.engine?.transform?.isActive(
                state.target
            )
        ) {
            window.Transfork.engine.transform.cancel();
        }
        else if (state.target) {
            state.target.setXY(state.startX, state.startY);
            requestRedraw(state.target);
        }

        reset();
        return true;
    }

    function reset() {
        for (const cleanup of state.cleanup) {
            try {
                cleanup();
            } catch (error) {
                console.error('[Transfork move cleanup]', error);
            }
        }

        state = makeState();
    }

    function isActive(target) {
        if (!state.active) return false;
        if (!target) return true;
        return state.target === target || state.target?.id === target.id;
    }

    function getSnapshot() {
        return {
            active: state.active,
            target: state.target,
            source: state.source,
            startMouseX: state.startMouseX,
            startMouseY: state.startMouseY,
            startX: state.startX,
            startY: state.startY,
            lastX: state.lastX,
            lastY: state.lastY
        };
    }

    function dispose() {
        cancel();
        reset();
    }

    window.Transfork.tools.moveTool = {
        begin,
        update,
        commit,
        cancel,
        reset,
        isActive,
        getSnapshot,
        dispose
    };

    console.log('[Transfork tools] move tool loaded');
})();
