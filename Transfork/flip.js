window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function getVM() {
        return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null;
    }

    function preserveLegacyFlipScale(event) {
        const box = api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box");
        if (!box || !box.contains(event.target)) return;

        const text = String(event.target?.textContent || "").trim();
        if (text !== "⇋" && text !== "⇅") return;

        const vm = getVM();
        const target = vm?.editingTarget;
        const drawable = api.drawable?.getDrawable?.(target);
        const savedScale = drawable?.scale?.slice?.();
        if (!vm || !target || !drawable || !savedScale) return;

        setTimeout(() => {
            const latestDrawable = api.drawable?.getDrawable?.(target);
            if (!latestDrawable || typeof latestDrawable.updateScale !== "function") return;

            const xSign = target.__gandhiVisualFlipX ? -1 : 1;
            latestDrawable.updateScale([
                xSign * Math.abs(savedScale[0] || 1),
                savedScale[1]
            ]);

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