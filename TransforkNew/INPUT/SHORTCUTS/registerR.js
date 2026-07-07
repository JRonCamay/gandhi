window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};
window.TransforkNew.INPUT.SHORTCUTS = window.TransforkNew.INPUT.SHORTCUTS || {};

(function () {
    "use strict";

    const api = window.TransforkNew;
    const ownerKey = "transforkNew.rShortcut260707_a8f4qz";

    function toggleR() {
        const shortcuts = api.INPUT?.shortcuts;
        const box = api.UI?.elements?.boundingBox;

        box?.init?.();
        api.UI?.elements?.buttons?.init?.();

        shortcuts.rVisible = !shortcuts.rVisible;

        if (shortcuts.rVisible) {
            const state = api.FACTORY?.run?.({ id: "transforkNew.r" });
            if (!state?.box?.visible) shortcuts.rVisible = false;
            return;
        }

        api.UI?.elements?.BOUNDINGBOX?.hide?.(box);
    }

    function registerR(shortcuts) {
        if (shortcuts.rRegistered) return;
        shortcuts.rRegistered = true;
        shortcuts.rVisible = false;

        window.TransforkNewMAR?.register?.({
            key: ownerKey,
            creator: "Elric",
            purpose: "TransforkNew R shortcut toggles the UI test overlay.",
            timestamp: 2607071200,
            parent: "TransforkNew/INPUT/SHORTCUTS/registerR.js",
            on: true
        });

        api.INPUT.SHORTCUTS.toggleR = toggleR;

        if (window.__TransforkNewPendingR) {
            const check = setInterval(() => {
                const ready = api.UI?.elements?.boundingBox && api.UI?.elements?.BOUNDINGBOX;
                if (ready) {
                    window.__TransforkNewPendingR = false;
                    clearInterval(check);
                    toggleR();
                }
            }, 50);
        }
    }

    api.INPUT.SHORTCUTS.toggleR = toggleR;
    api.INPUT.SHORTCUTS.registerR = registerR;
})();
