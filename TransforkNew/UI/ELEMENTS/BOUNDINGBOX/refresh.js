window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};
window.TransforkNew.UI.elements = window.TransforkNew.UI.elements || {};
window.TransforkNew.UI.elements.BOUNDINGBOX = window.TransforkNew.UI.elements.BOUNDINGBOX || {};

(function () {
    "use strict";

    const api = window.TransforkNew;

    function refresh(box) {
        const vm = api.SYSTEM?.vm?.get?.();
        const target = api.SYSTEM?.VM?.getSelectedTarget?.();
        const drawable = api.SYSTEM?.VM?.getDrawable?.(target);
        const canvas = api.SYSTEM?.VM?.getCanvas?.();

        if (!vm || !target || target.isStage || !drawable || !canvas) {
            api.UI.elements.BOUNDINGBOX?.hide?.(box);
            return null;
        }

        const bounds = typeof drawable.getAABB === "function"
            ? drawable.getAABB()
            : null;

        const rect = api.UTILS?.COORDS?.boundsToScreenRect?.(
            bounds,
            canvas,
            vm
        );

        if (!rect) {
            api.UI.elements.BOUNDINGBOX?.hide?.(box);
            return null;
        }

        api.UI.elements.BOUNDINGBOX?.update?.(box, rect);
        api.UI.elements.BOUNDINGBOX?.show?.(box);
        return rect;
    }

    window.TransforkNew.UI.elements.BOUNDINGBOX.refresh = refresh;
})();
