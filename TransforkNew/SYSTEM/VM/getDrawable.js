window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.VM.getDrawable.js.getDrawable", file: "TransforkNew/SYSTEM/VM/getDrawable.js", functionName: "getDrawable", purpose: "local process member registration for getDrawable", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    function getDrawable(target) {
        const vm = window.TransforkNew.SYSTEM.VM?.get?.() || window.TransforkNew.SYSTEM.VM?.waitForVM?.() || null;
        const activeTarget = target || vm?.editingTarget || null;
        if (!vm?.runtime?.renderer || !activeTarget) return null;
        return vm.runtime.renderer._allDrawables[activeTarget.drawableID] || null;
    }

    window.TransforkNew.SYSTEM.VM.getDrawable = getDrawable;
})();
