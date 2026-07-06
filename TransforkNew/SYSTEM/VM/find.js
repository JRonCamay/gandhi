window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.VM = window.TransforkNew.SYSTEM.VM || {};

(function () {
    "use strict";

    function find() {
        if (window.vm?.runtime?.renderer) return window.vm;
        if (window.Scratch?.vm?.runtime?.renderer) return window.Scratch.vm;

        const sprite = document.querySelector('[class*="sprite-selector"]');
        if (!sprite) return null;

        const fiberKey = Object.keys(sprite).find(key => key.startsWith("__reactFiber$"));
        if (!fiberKey) return null;

        let node = sprite[fiberKey];
        while (node) {
            const props = node.memoizedProps;
            if (props?.vm?.runtime?.renderer) {
                window.vm = props.vm;
                return props.vm;
            }
            node = node.return;
        }

        return null;
    }

    window.TransforkNew.SYSTEM.VM.find = find;
})();
