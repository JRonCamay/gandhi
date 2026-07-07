window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/FACTORY/02_vm.js";
    const LINE = "MAIN";
    const STATION = 2;
    const ID = "FACTORY.02.vm";
    const PURPOSE = "main factory resolve vm";

    window.TransforkNew.FACTORY.MANAGER?.register?.({ id: ID, file: FILE, functionName: "vm", purpose: PURPOSE, line: LINE, station: STATION });

    function vm(state = {}) {
        if (!window.TransforkNew.FACTORY.MANAGER?.guard?.(LINE, STATION, FILE, "vm")) return state;
        try {
            state.vm = window.TransforkNew.SYSTEM?.vm?.get?.() || null;
            window.TransforkNew.SYSTEM?.debug?.log?.("FACTORY station vm", {
                vm: state.vm,
                vmState: window.TransforkNew.SYSTEM?.VM?.state
            });
            return state;
        } catch (error) {
            window.TransforkNew.SYSTEM?.debug?.error?.(FILE + " vm", error);
            return state;
        }
    }

    window.TransforkNew.FACTORY.vm = vm;
})();
