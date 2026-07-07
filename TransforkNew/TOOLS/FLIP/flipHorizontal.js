window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FLIP = window.TransforkNew.FLIP || {};

(function () {
    "use strict";

    function normalizeDirection(degrees) {
        let value = Number(degrees) || 0;
        while (value > 180) value -= 360;
        while (value <= -180) value += 360;
        return value;
    }

    function transform(target, drawable) {
        if (!target || !drawable) return false;
        drawable.updateScale?.([-(drawable.scale?.[0] || 100), drawable.scale?.[1] || 100]);
        target.setDirection?.(normalizeDirection(180 - target.direction));
        return true;
    }

    function commit(target) {
        target?.emitVisualChange?.();
        window.TransforkNew.SYSTEM?.vm?.get?.()?.runtime?.requestRedraw?.();
    }

    function flipHorizontal() {
        const line = window.TransforkNew.TOOLS?.line;
        const lineId = "flip.horizontal";
        if (!line?.acquireLine?.(lineId)) return false;

        try {
            const target = window.TransforkNew.SYSTEM?.VM?.getSelectedTarget?.() || null;
            const drawable = window.TransforkNew.SYSTEM?.VM?.getDrawable?.() || null;
            const changed = transform(target, drawable);
            if (changed) commit(target);
            window.TransforkNew.REFRESH?.run?.({ id: lineId, command: "FLIP_H" });
            return changed;
        } finally {
            line.releaseLine?.(lineId);
        }
    }

    window.TransforkNew.FLIP.flipHorizontal = flipHorizontal;
})();
