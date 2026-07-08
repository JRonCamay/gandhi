window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.vm.js.init", file: "TransforkNew/SYSTEM/vm.js", functionName: "init", purpose: "local process member registration for init", manager: "VM", station: 0 },
            { id: "VM.local.TransforkNew.SYSTEM.vm.js.get", file: "TransforkNew/SYSTEM/vm.js", functionName: "get", purpose: "local process member registration for get", manager: "VM", station: 0 },
            { id: "VM.local.TransforkNew.SYSTEM.vm.js.isReady", file: "TransforkNew/SYSTEM/vm.js", functionName: "isReady", purpose: "local process member registration for isReady", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    const api = window.TransforkNew;

    const vm = {
        init(callback) {
            return api.SYSTEM.VM?.waitForVM?.(found => {
                if (typeof callback === "function") callback(found);
            }) || null;
        },

        get() {
            return api.SYSTEM.VM?.get?.() || api.SYSTEM.VM?.waitForVM?.() || null;
        },

        isReady() {
            return api.SYSTEM.VM?.isReady?.() || false;
        }
    };

    api.SYSTEM.vm = vm;
})();
