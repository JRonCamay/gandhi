window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};
window.TransforkNew.INPUT.SHORTCUTS = window.TransforkNew.INPUT.SHORTCUTS || {};

(function () {
    "use strict";

    const api = window.TransforkNew;
    const ownerKey = "transforkNew.rShortcut260707_a8f4qz";

    function shouldIgnore(event) {
        const active = document.activeElement;
        const tag = active?.tagName;

        return (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            active?.isContentEditable
        );
    }

    function toggleR() {
        const shortcuts = api.INPUT?.shortcuts;
        const box = api.UI?.elements?.boundingBox;

        box?.init?.();
        api.UI?.elements?.buttons?.init?.();

        shortcuts.rVisible = !shortcuts.rVisible;

        if (shortcuts.rVisible) {
            const rect = api.UI?.elements?.BOUNDINGBOX?.refresh?.(box);
            if (!rect) shortcuts.rVisible = false;
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

        window.addEventListener(
            "keydown",
            event => {
                if (window.TransforkNewMAR && !window.TransforkNewMAR.isOn(ownerKey)) return;
                if (shouldIgnore(event)) return;
                if (event.ctrlKey || event.metaKey || event.altKey) return;
                if (event.key?.toLowerCase() !== "r") return;

                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                toggleR();
            },
            true
        );
    }

    api.INPUT.SHORTCUTS.toggleR = toggleR;
    api.INPUT.SHORTCUTS.registerR = registerR;
})();
