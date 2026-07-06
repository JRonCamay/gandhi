window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function getVM() {
        return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null;
    }

    function getCanvas() {
        return api.coords?.getStageCanvas?.() || document.querySelector("canvas");
    }

    function center(rect) {
        return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null;
    }

    function pixelRect(vm, target, drawable, canvas) {
        return api.pixelBounds?.rect?.(vm, target, drawable, canvas) || null;
    }

    const transformOpsModule260705_TO9M5H = {
        moveTarget(target, x, y) {
            if (!target || typeof target.setXY !== "function") return;
            target.setXY(x, y);
            api.vm.requestRedraw(target);
        },

        setDirection(target, direction) {
            if (!target || typeof target.setDirection !== "function") return;
            target.setDirection(direction);
            api.vm.requestRedraw(target);
        },

        setSize(target, size) {
            if (!target || typeof target.setSize !== "function") return;
            target.setSize(size);
            api.vm.requestRedraw(target);
        },

        setAlpha(target, alpha) {
            if (!target || typeof target.setEffect !== "function") return;
            const value = api.math.clamp(Number(alpha), 0, 100);
            target.setEffect("ghost", 100 - value);
            api.vm.requestRedraw(target);
        },

        getAlpha(target) {
            if (!target || !target.effects) return 100;
            return 100 - (target.effects.ghost || 0);
        },

        restoreVisualScale(target, savedScale) {
            if (!target || !savedScale) return;
            const xSign = target.__gandhiVisualFlipX ? -1 : 1;
            api.drawable.setScale(target, [
                xSign * Math.abs(savedScale[0] || 1),
                savedScale[1]
            ]);
        },

        keepPixelCenter(target, beforeCenter) {
            const vm = getVM();
            const canvas = getCanvas();
            const drawable = api.drawable.getDrawable(target);
            const afterCenter = center(pixelRect(vm, target, drawable, canvas));
            if (!vm || !canvas || !target || !beforeCenter || !afterCenter || !api.coords?.screenDeltaToScratch) return;
            const delta = api.coords.screenDeltaToScratch(
                beforeCenter.x - afterCenter.x,
                beforeCenter.y - afterCenter.y,
                canvas,
                vm
            );
            target.setXY(target.x + delta.x, target.y + delta.y);
        },

        flipHorizontal(target) {
            if (!target) return;
            const vm = getVM();
            const canvas = getCanvas();
            const drawable = api.drawable.getDrawable(target);
            const beforeCenter = center(pixelRect(vm, target, drawable, canvas));
            const oldDirection = target.direction;
            const savedScale = api.drawable.getScale(target);
            target.setDirection(api.math.normalizeDirection(180 - oldDirection));
            target.__gandhiVisualFlipX = !target.__gandhiVisualFlipX;
            this.restoreVisualScale(target, savedScale);
            this.keepPixelCenter(target, beforeCenter);
            api.vm.requestRedraw(target);
        },

        flipVertical(target) {
            if (!target) return;
            const vm = getVM();
            const canvas = getCanvas();
            const drawable = api.drawable.getDrawable(target);
            const beforeCenter = center(pixelRect(vm, target, drawable, canvas));
            const oldDirection = target.direction;
            const savedScale = api.drawable.getScale(target);
            target.setDirection(api.math.normalizeDirection(-oldDirection));
            target.__gandhiVisualFlipX = !target.__gandhiVisualFlipX;
            this.restoreVisualScale(target, savedScale);
            this.keepPixelCenter(target, beforeCenter);
            api.vm.requestRedraw(target);
        }
    };

    api.registerModule260705_NS8Q2M("transformOps", transformOpsModule260705_TO9M5H);
})();