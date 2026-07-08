window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.02.vm.js.vm", file: "TransforkNew/FACTORY/02_vm.js", functionName: "vm", purpose: "local process member registration for vm", manager: "MAIN", station: 2 }
        ].forEach(register);
    })();

    const FILE = "TransforkNew/FACTORY/02_vm.js";
    const LINE = "MAIN";
    const STATION = 2;
    const ID = "FACTORY.02.vm";
    const PURPOSE = "main factory resolve vm";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "vm", purpose: PURPOSE, line: LINE, station: STATION });

    function vm(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "vm")) return { status: "stop", reason: "guardian blocked", station: STATION };
        try {
            state.vm = window.TransforkNew.SYSTEM?.vm?.get?.() || null;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station vm", {
                vm: state.vm,
                vmState: window.TransforkNew.SYSTEM?.VM?.state
            });
            if (!state.vm) return { status: "stop", reason: "vm missing", station: STATION };
            return { status: "done", station: STATION };
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " vm", error);
            return { status: "stop", reason: "vm crashed", station: STATION, error };
        }
    }

    window.TransforkNew.FACTORY.vm = vm;
})();
