/*
Transfork/tools/resize-tool.js
Resize interaction module for Transfork.

Scope:
- Owns resize calculations only.
- No DOM creation.
- Preserves legacy drawable.updateScale and target.setSize behavior.
*/

(function () {
    "use strict";

    window.Transfork = window.Transfork || {};
    window.Transfork.tools = window.Transfork.tools || {};

    function makeState() {
        return {
            active: false,
            target: null,
            vm: null,
            mode: "uniform",
            startX: 0,
            startY: 0,
            startSize: 0,
            startScaleX: 0,
            startScaleY: 0,
            startTargetSize: 100,
            uniformBaseScale: 0,
            lastUniformRatio: 1,
            visualFlipX: false,
            installShearHook: null
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
            !state.vm ||
            !state.vm.runtime ||
            !state.vm.runtime.renderer ||
            !target
        ) {
            return null;
        }

        return state.vm.runtime.renderer._allDrawables[
            target.drawableID
        ];
    }

    function getVisualFlipX(context) {
        if (
            context &&
            typeof context.getVisualFlipX === "function"
        ) {
            return context.getVisualFlipX();
        }

        return !!state.visualFlipX;
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

        const vm =
              context &&
              context.vm;

        if (
            !target ||
            !vm
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
        state.vm = vm;
        state.mode =
            context.mode ||
            "uniform";
        state.startX =
            event.clientX;
        state.startY =
            event.clientY;
        state.installShearHook =
            context.installShearHook;
        state.visualFlipX =
            getVisualFlipX(context);

        installHook(
            drawable,
            target
        );

        state.startScaleX =
            drawable.scale[0];

        state.startScaleY =
            drawable.scale[1];

        state.startTargetSize =
            target.size;

        if (
            state.mode ===
            "height"
        ) {
            state.startSize =
                Math.abs(
                    drawable.scale[1]
                );
        }
        else {
            state.startSize =
                Math.abs(
                    drawable.scale[0]
                );
        }

        state.uniformBaseScale =
            Math.max(
                Math.abs(
                    drawable.scale[0]
                ),
                Math.abs(
                    drawable.scale[1]
                )
            );

        return true;
    }

    function update(event, context) {
        if (
            !state.active ||
            !state.target
        ) {
            return false;
        }

        let delta;

        if (
            state.mode ===
            "height"
        ) {
            delta =
                event.clientY -
                state.startY;
        }
        else {
            delta =
                event.clientX -
                state.startX;
        }

        const drawable =
              getDrawable(
                  state.target,
                  context
              );

        if (!drawable) {
            return false;
        }

        installHook(
            drawable,
            state.target
        );

        const signX =
              getVisualFlipX(context)
                  ? -1
                  : 1;

        const signY =
              Math.sign(
                  drawable.scale[1]
              ) || 1;

        const newScale =
              Math.max(
                  0.01,
                  state.startSize + delta
              );

        if (
            state.mode ===
            "uniform"
        ) {
            updateUniform(
                drawable,
                signX,
                newScale
            );
        }
        else if (
            state.mode ===
            "width"
        ) {
            updateWidth(
                drawable,
                signX,
                newScale
            );
        }
        else if (
            state.mode ===
            "height"
        ) {
            updateHeight(
                drawable,
                signX,
                signY,
                newScale
            );
        }

        state.target.emitVisualChange();

        return true;
    }

    function updateUniform(drawable, signX, newScale) {
        const ratio =
              newScale /
              state.uniformBaseScale;

        state.lastUniformRatio =
            ratio;

        preserveCenter(
            drawable,
            () => {
                drawable.updateScale([
                    signX *
                    Math.abs(
                        state.startScaleX
                    ) *
                    ratio,
                    state.startScaleY *
                    ratio
                ]);
            }
        );
    }

    function updateWidth(drawable, signX, newScale) {
        preserveCenter(
            drawable,
            () => {
                drawable.updateScale([
                    signX *
                    newScale,
                    state.startScaleY
                ]);
            }
        );
    }

    function updateHeight(
        drawable,
        signX,
        signY,
        newScale
    ) {
        preserveCenter(
            drawable,
            () => {
                drawable.updateScale([
                    signX *
                    Math.abs(
                        state.startScaleX
                    ),
                    signY *
                    newScale
                ]);
            }
        );
    }

    function preserveCenter(drawable, applyScale) {
        const oldBounds =
              drawable.getAABB();

        applyScale();

        const newBounds =
              drawable.getAABB();

        const oldCenterX =
              (
                  oldBounds.left +
                  oldBounds.right
              ) / 2;

        const oldCenterY =
              (
                  oldBounds.top +
                  oldBounds.bottom
              ) / 2;

        const newCenterX =
              (
                  newBounds.left +
                  newBounds.right
              ) / 2;

        const newCenterY =
              (
                  newBounds.top +
                  newBounds.bottom
              ) / 2;

        state.target.setXY(
            state.target.x +
            oldCenterX -
            newCenterX,
            state.target.y +
            oldCenterY -
            newCenterY
        );
    }

    function commit() {
        if (
            state.active &&
            state.mode ===
            "uniform" &&
            state.target
        ) {
            const size =
                  state.startTargetSize *
                  state.lastUniformRatio;

            state.target.setSize(
                size
            );

            state.target.emitVisualChange();

            if (
                state.vm &&
                state.vm.runtime &&
                typeof state.vm.runtime.requestRedraw === "function"
            ) {
                state.vm.runtime.requestRedraw();
            }
        }

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

    window.Transfork.tools.resizeTool = {
        begin,
        update,
        commit,
        cancel,
        isActive,
        dispose
    };
})();
