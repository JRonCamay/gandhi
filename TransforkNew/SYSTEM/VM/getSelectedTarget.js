window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function getSelectedTarget() {
        const vm = window.TransforkNew.SYSTEM.VM?.get?.() || window.TransforkNew.SYSTEM.VM?.waitForVM?.() || null;
        return vm?.editingTarget || null;
    }

    window.TransforkNew.SYSTEM.VM.getSelectedTarget = getSelectedTarget;
})();
