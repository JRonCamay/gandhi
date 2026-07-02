/*
Transfork/tools/rotate-tool.js
Rotate interaction module for Transfork.

Scope:
- Owns rotation calculations only.
- No DOM creation.
- Preserves legacy target.setDirection and drawable.updateScale behavior.
*/

(function () {
    "use strict";

    window.Transfork = window.Transfork || {};
    window.Transfork.tools = window.Transfork.tools || {};

    function makeState() {
        return {
            active: false,
            target: null,
            renderer: null,
            installShearHook: null,
            centerX: 0,
            centerY: 0,
            rotateScaleX: 0,
            rotateScaleY: 0,
            startDirection: 0,
            startAngle: 0
        };
    }

    let state = makeState();

    function getDrawable(target, context) {
        if (
            context &&
            typeof context.getDrawable === "function"
        ) {
            return context.getDrawable(target);
        }

        if (
            !state.renderer ||
            !target
        ) {
            return null;
        }

        return state.renderer._allDrawables[
            target.drawableID
        ];
    }

    function installHook(drawable, target) {
        if (
            drawable &&
            typeof state.installShearHook === "function"
        ) {
            state.installShearHook(
                drawable,
                target
            );
        }
    }

    function begin(event, context) {
        const target =
              context &&
              context.target;

        const renderer =
              context &&
              context.renderer;

        const overlay =
              context &&
              context.overlay;

        if (
            !target ||
            !renderer ||
            !overlay
        ) {
            return false;
        }

        const drawable =
              getDrawable(
                  target,
                  context
              );

        if (!drawable) {
            return false;
        }

        state = makeState();
        state.active = true;
        state.target = target;
        state.renderer = renderer;
        state.installShearHook =
            context.installShearHook;

        installHook(
            drawable,
            target
        );

        state.rotateScaleX =
            drawable.scale[0];

        state.rotateScaleY =
            drawable.scale[1];

        const rect =
              overlay.getBoundingClientRect();

        state.centerX =
            rect.left +
            rect.width / 2;

        state.centerY =
            rect.top +
            rect.height / 2;

        state.startAngle =
            Math.atan2(
                event.clientY -
                state.centerY,
                event.clientX -
                state.centerX
            );

        state.startDirection =
            target.direction;

        return true;
    }

    function update(event, context) {
        if (
            !state.active ||
            !state.target
        ) {
            return false;
        }

        const angle =
              Math.atan2(
                  event.clientY -
                  state.centerY,
                  event.clientX -
                  state.centerX
              );

        const delta =
              (
                  angle -
                  state.startAngle
              ) *
              180 /
              Math.PI;

        const newDirection =
              state.startDirection +
              delta;

        state.target.setDirection(
            newDirection
        );

        const drawable =
              getDrawable(
                  state.target,
                  context
              );

        installHook(
            drawable,
            state.target
        );

        if (drawable) {
            drawable.updateScale([
                state.rotateScaleX,
                state.rotateScaleY
            ]);
        }

        return true;
    }

    function commit() {
        reset();
    }

    function cancel() {
        reset();
    }

    function reset() {
        state = makeState();
    }

    function isActive() {
        return state.active;
    }

    function dispose() {
        cancel();
    }

    window.Transfork.tools.rotateTool = {
        begin,
        update,
        commit,
        cancel,
        isActive,
        dispose
    };
})();
