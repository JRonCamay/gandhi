/*
Transfork/engine/transform.js
Bridge between Transfork simulation and Scratch VM.

Rule:
- Simulation owns live editing state.
- Transform commits or cancels simulation.
- This module is the only engine module that mutates Scratch VM transform state.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};
    window.Transfork.engine = window.Transfork.engine || {};

    function getSimulation() {
        return window.Transfork?.engine?.simulation || null;
    }

    function getRuntime() {
        return window.vm?.runtime || null;
    }

    function requestRedraw() {
        const runtime = getRuntime();
        if (runtime && typeof runtime.requestRedraw === 'function') {
            runtime.requestRedraw();
        }
    }

    function emitVisualChange(target) {
        if (target && typeof target.emitVisualChange === 'function') {
            target.emitVisualChange();
        }
    }

    function clearGeometry(target) {
        if (window.Transfork?.geometry?.clear) {
            window.Transfork.geometry.clear(target);
        }
    }

    function applyPosition(target, transform) {
        if (!target || !transform) return false;

        if (typeof target.setXY === 'function') {
            target.setXY(transform.x, transform.y);
            return true;
        }

        return false;
    }

    function applyDirection(target, transform) {
        if (!target || !transform) return false;
        if (typeof transform.direction !== 'number') return false;

        if (typeof target.setDirection === 'function') {
            target.setDirection(transform.direction);
            return true;
        }

        return false;
    }

    function applySize(target, transform) {
        if (!target || !transform) return false;
        if (typeof transform.size !== 'number') return false;

        if (typeof target.setSize === 'function') {
            target.setSize(transform.size);
            return true;
        }

        return false;
    }

    function begin(target, meta) {
        const simulation = getSimulation();
        if (!simulation) return false;

        return simulation.begin(target, meta);
    }

    function update(values) {
        const simulation = getSimulation();
        if (!simulation) return false;

        return simulation.update(values);
    }

    function commit() {
        const simulation = getSimulation();
        if (!simulation) return null;

        const snapshot = simulation.getSnapshot();
        if (!snapshot.active || !snapshot.target || !snapshot.current) {
            return null;
        }

        const target = snapshot.target;
        const transform = snapshot.current;

        applyPosition(target, transform);
        applyDirection(target, transform);
        applySize(target, transform);

        emitVisualChange(target);
        requestRedraw();
        clearGeometry(target);

        return simulation.end();
    }

    function cancel() {
        const simulation = getSimulation();
        if (!simulation) return false;

        const snapshot = simulation.getSnapshot();
        if (!snapshot.active) return false;

        return simulation.cancel();
    }

    function refreshFromTarget() {
        const simulation = getSimulation();
        if (!simulation) return false;

        const snapshot = simulation.getSnapshot();
        if (!snapshot.active || !snapshot.target) return false;

        const target = snapshot.target;
        const meta = snapshot.meta || {};

        simulation.cancel();
        return simulation.begin(target, meta);
    }

    function isActive(target) {
        const simulation = getSimulation();
        return !!simulation?.isActive(target);
    }

    function getSnapshot() {
        const simulation = getSimulation();
        return simulation?.getSnapshot() || null;
    }

    window.Transfork.engine.transform = {
        begin,
        update,
        commit,
        cancel,
        refreshFromTarget,
        isActive,
        getSnapshot
    };

    console.log('[Transfork engine] transform loaded');
})();
