window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function getDrawable(target) {
        const vm = window.TransforkNew.SYSTEM.vm?.get?.();
        if (!vm?.runtime?.renderer || !target) return null;
        return vm.runtime.renderer._allDrawables[target.drawableID] || null;
    }

    window.TransforkNew.SYSTEM.VM.getDrawable = getDrawable;
})();
