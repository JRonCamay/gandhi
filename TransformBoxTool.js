// ==UserScript==
// @name         Gandhi Transform Box
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  Transform box with resize handle and dynamic alpha/opacity control
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const SOURCE_URL = "https://raw.githubusercontent.com/JRonCamay/gandhi/ed41ad42681aba642995d07c910849b93de6feaa/TransformBoxTool.js";

    const OLD_SKEW_MOUSE_UP = String.raw`        onUp() {
            const finalShearX =
                  activeShearBridge
                      ? activeShearBridge.shearX
                      : 0;

            const finalShearY =
                  activeShearBridge
                      ? activeShearBridge.shearY
                      : 0;

            activeShearBridge = null;
            this.destroy();
            activeSkewSession = null;

            this.drawable.setTransformDirty();

            this.target.setXY(
                this.target.x,
                this.target.y
            );

            this.target.emitVisualChange();
            vm.runtime.requestRedraw();

            AssetBakeEngine.bakeCurrentCostume(
                (
                    canvas,
                    ctx,
                    image,
                    costume
                ) => {
                    bakeSkewToCanvas(
                        canvas,
                        costume,
                        finalShearX,
                        finalShearY
                    );

                    return updateSelectionBox;
                },
                this.target
            );
        },`;

    const NEW_SKEW_MOUSE_UP = String.raw`        onUp() {
            if (this.baking) return;

            const finalShearX =
                  activeShearBridge
                      ? activeShearBridge.shearX
                      : 0;

            const finalShearY =
                  activeShearBridge
                      ? activeShearBridge.shearY
                      : 0;

            this.baking = true;

            if (
                activeShearBridge &&
                activeShearBridge.drawable === this.drawable
            ) {
                activeShearBridge.shearX =
                    finalShearX;

                activeShearBridge.shearY =
                    finalShearY;
            }

            window.removeEventListener("mousemove", this.boundMove, true);
            window.removeEventListener("mouseup", this.boundUp, true);

            this.drawable.setTransformDirty();

            this.target.setXY(
                this.target.x,
                this.target.y
            );

            this.target.emitVisualChange();
            vm.runtime.requestRedraw();

            AssetBakeEngine.bakeCurrentCostume(
                (
                    canvas,
                    ctx,
                    image,
                    costume
                ) => {
                    bakeSkewToCanvas(
                        canvas,
                        costume,
                        finalShearX,
                        finalShearY
                    );

                    return () => {
                        this.drawable.setTransformDirty();

                        this.target.setXY(
                            this.target.x,
                            this.target.y
                        );

                        this.target.emitVisualChange();
                        vm.runtime.requestRedraw();

                        updateSelectionBox();

                        this.destroy();
                        activeSkewSession = null;

                        this.drawable.setTransformDirty();
                        this.target.emitVisualChange();
                        vm.runtime.requestRedraw();
                    };
                },
                this.target
            );
        },`;

    fetch(SOURCE_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error("TransformBoxTool source failed: " + response.status);
            }

            return response.text();
        })
        .then(source => {
            const patched = source.replace(
                OLD_SKEW_MOUSE_UP,
                NEW_SKEW_MOUSE_UP
            );

            if (patched === source) {
                throw new Error("TransformBoxTool skew workflow patch was not applied");
            }

            eval(patched);
        })
        .catch(error => {
            console.error("[Gandhi Transform Box]", error);
        });
})();
