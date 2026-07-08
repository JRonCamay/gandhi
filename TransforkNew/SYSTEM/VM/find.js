window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "VM.local.TransforkNew.SYSTEM.VM.find.js.log", file: "TransforkNew/SYSTEM/VM/find.js", functionName: "log", purpose: "local process member registration for log", manager: "VM", station: 0 },
            { id: "VM.local.TransforkNew.SYSTEM.VM.find.js.find", file: "TransforkNew/SYSTEM/VM/find.js", functionName: "find", purpose: "local process member registration for find", manager: "VM", station: 0 }
        ].forEach(register);
    })();

    function log(label, data) {
        window.TransforkNew.SYSTEM?.debug?.log?.("VM find " + label, data);
    }

    function find() {
        log("start");

        if (window.vm?.runtime?.renderer) {
            log("window.vm found", window.vm);
            return window.vm;
        }

        if (window.Scratch?.vm?.runtime?.renderer) {
            log("window.Scratch.vm found", window.Scratch.vm);
            return window.Scratch.vm;
        }

        const sprite = document.querySelector('[class*="sprite-selector"]');
        log("sprite selector", sprite);
        if (!sprite) return null;

        const fiberKey = Object.keys(sprite).find(key => key.startsWith("__reactFiber$"));
        log("fiberKey", fiberKey);
        if (!fiberKey) return null;

        let node = sprite[fiberKey];
        let depth = 0;
        while (node) {
            const props = node.memoizedProps;
            if (props?.vm?.runtime?.renderer) {
                window.vm = props.vm;
                log("react props.vm found", { depth, vm: props.vm });
                return props.vm;
            }
            node = node.return;
            depth += 1;
        }

        log("not found after react walk", { depth });
        return null;
    }

    window.TransforkNew.SYSTEM.VM.find = find;
})();
