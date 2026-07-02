/*
Transfork/asset-bake-engine.js
Extracted asset baking module for Transfork.
*/

(function () {
    'use strict';

    window.Transfork = window.Transfork || {};

    function getVM() {
        return window.vm || null;
    }

    function getCurrentCostume(target) {
        if (
            !target ||
            !target.sprite ||
            !target.sprite.costumes
        ) {
            return null;
        }

        return target.sprite.costumes[target.currentCostume];
    }

    function getCostumeSource(costume) {
        if (!costume || !costume.asset) return null;

        if (typeof costume.asset.encodeDataURI === 'function') {
            return costume.asset.encodeDataURI();
        }

        return null;
    }

    function getCanvasWidth(image, costume) {
        return (
            image.naturalWidth ||
            image.width ||
            (costume && costume.size && costume.size[0]) ||
            1
        );
    }

    function getCanvasHeight(image, costume) {
        return (
            image.naturalHeight ||
            image.height ||
            (costume && costume.size && costume.size[1]) ||
            1
        );
    }

    function exportCanvas(canvas, callback) {
        canvas.toBlob(
            blob => {
                if (!blob) return;

                const reader = new FileReader();

                reader.onload = () => {
                    callback(new Uint8Array(reader.result));
                };

                reader.readAsArrayBuffer(blob);
            },
            'image/png'
        );
    }

    function createCostumeAsset(data) {
        const vm = getVM();
        const storage = vm?.runtime?.storage;

        if (!storage || typeof storage.createAsset !== 'function') {
            return null;
        }

        const assetType =
            (storage.AssetType && storage.AssetType.ImageBitmap) ||
            'ImageBitmap';

        const dataFormat =
            (storage.DataFormat && storage.DataFormat.PNG) ||
            'png';

        return storage.createAsset(
            assetType,
            dataFormat,
            data,
            null,
            true
        );
    }

    function replaceCurrentCostume(target, costume, asset, canvas) {
        const vm = getVM();

        if (
            !vm ||
            !target ||
            !target.sprite ||
            !target.sprite.costumes ||
            !asset
        ) {
            return;
        }

        const index = target.currentCostume;
        const skinId = costume.skinId;
        const replacement = Object.assign({}, costume);

        replacement.asset = asset;
        replacement.assetId = asset.assetId;
        replacement.dataFormat = 'png';
        replacement.md5ext = asset.assetId + '.png';
        replacement.skinId = skinId;

        if (canvas && canvas.width && canvas.height) {
            replacement.size = [canvas.width, canvas.height];
        }

        if (
            canvas &&
            typeof canvas.__gandhiBakeRotationCenterX === 'number' &&
            typeof canvas.__gandhiBakeRotationCenterY === 'number'
        ) {
            replacement.rotationCenterX = canvas.__gandhiBakeRotationCenterX;
            replacement.rotationCenterY = canvas.__gandhiBakeRotationCenterY;
        }

        target.sprite.costumes[index] = replacement;

        vm.runtime.renderer.updateBitmapSkin(
            skinId,
            canvas,
            replacement.bitmapResolution || 1,
            [
                replacement.rotationCenterX,
                replacement.rotationCenterY
            ]
        );

        target.setCostume(index);

        if (typeof target.updateAllDrawableProperties === 'function') {
            target.updateAllDrawableProperties();
        }

        target.emitVisualChange();
        vm.runtime.requestRedraw();
    }

    function bakeCurrentCostume(callback, targetOverride) {
        const vm = getVM();
        if (!vm) return;

        const target = targetOverride || vm.editingTarget;
        const costume = getCurrentCostume(target);
        const source = getCostumeSource(costume);

        if (!source) return;

        const image = new Image();

        image.onload = () => {
            const canvas = document.createElement('canvas');

            canvas.width = getCanvasWidth(image, costume);
            canvas.height = getCanvasHeight(image, costume);

            const ctx = canvas.getContext('2d');
            ctx.drawImage(image, 0, 0);

            let afterBake = null;

            if (typeof callback === 'function') {
                afterBake = callback(
                    canvas,
                    ctx,
                    image,
                    costume,
                    target
                );
            }

            exportCanvas(
                canvas,
                data => {
                    const asset = createCostumeAsset(data);

                    if (
                        canvas &&
                        typeof canvas.__gandhiBeforeReplace === 'function'
                    ) {
                        canvas.__gandhiBeforeReplace();
                    }

                    replaceCurrentCostume(
                        target,
                        costume,
                        asset,
                        canvas
                    );

                    if (typeof afterBake === 'function') {
                        afterBake();
                    }
                }
            );
        };

        image.src = source;
    }

    window.Transfork.assetBakeEngine = {
        bakeCurrentCostume
    };

    window.AssetBakeEngine = window.Transfork.assetBakeEngine;

    console.log('[Transfork] asset bake engine loaded');
})();
