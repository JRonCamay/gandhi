window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FLIP = window.TransforkNew.FLIP || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.TOOLS.FLIP.flipHorizontal.js.normalizeDirection", file: "TransforkNew/TOOLS/FLIP/flipHorizontal.js", functionName: "normalizeDirection", purpose: "local process member registration for normalizeDirection", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.FLIP.flipHorizontal.js.transform", file: "TransforkNew/TOOLS/FLIP/flipHorizontal.js", functionName: "transform", purpose: "local process member registration for transform", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.FLIP.flipHorizontal.js.commit", file: "TransforkNew/TOOLS/FLIP/flipHorizontal.js", functionName: "commit", purpose: "local process member registration for commit", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.TOOLS.FLIP.flipHorizontal.js.flipHorizontal", file: "TransforkNew/TOOLS/FLIP/flipHorizontal.js", functionName: "flipHorizontal", purpose: "local process member registration for flipHorizontal", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

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
