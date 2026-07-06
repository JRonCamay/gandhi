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

    function preserveLegacyFlipScale(event) {
        const box = api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box");
        if (!box || !box.contains(event.target)) return;

        const text = String(event.target?.textContent || "").trim();
        if (text !== "⇋" && text !== "⇅") return;

        const vm = getVM();
        const canvas = getCanvas();
        const target = vm?.editingTarget;
        const drawable = api.drawable?.getDrawable?.(target);
        const savedScale = drawable?.scale?.slice?.();
        const beforeCenter = center(pixelRect(vm, target, drawable, canvas));
        if (!vm || !canvas || !target || !drawable || !savedScale) return;

        setTimeout(() => {
            const latestDrawable = api.drawable?.getDrawable?.(target);
            if (!latestDrawable || typeof latestDrawable.updateScale !== "function") return;

            const xSign = target.__gandhiVisualFlipX ? -1 : 1;
            latestDrawable.updateScale([
                xSign * Math.abs(savedScale[0] || 1),
                savedScale[1]
            ]);

            const afterCenter = center(pixelRect(vm, target, latestDrawable, canvas));
            if (beforeCenter && afterCenter && api.coords?.screenDeltaToScratch) {
                const delta = api.coords.screenDeltaToScratch(
                    beforeCenter.x - afterCenter.x,
                    beforeCenter.y - afterCenter.y,
                    canvas,
                    vm
                );
                target.setXY(target.x + delta.x, target.y + delta.y);
            }

            target.emitVisualChange?.();
            vm.runtime.requestRedraw?.();
        }, 0);
    }

    if (!api.__legacyFlipScaleGuard260706_FL8Q2M) {
        api.__legacyFlipScaleGuard260706_FL8Q2M = true;
        window.addEventListener("click", preserveLegacyFlipScale, true);
    }

    const flipModule260705_FL3C9P = {
        horizontal(target) {
            api.transformOps.flipHorizontal(target);
        },

        vertical(target) {
            api.transformOps.flipVertical(target);
        },

        reset(target) {
            if (!target) return;
            api.transformOps.setDirection(target, 90);
            api.transformOps.setSize(target, 100);
            api.transformOps.setAlpha(target, 100);
        }
    };

    api.registerModule260705_NS8Q2M("flip", flipModule260705_FL3C9P);
})();