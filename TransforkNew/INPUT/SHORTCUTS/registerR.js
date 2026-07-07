window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};
window.TransforkNew.INPUT.SHORTCUTS = window.TransforkNew.INPUT.SHORTCUTS || {};

(function () {
    "use strict";

    const api = window.TransforkNew;
    const ownerKey = "transforkNew.rShortcut260707_a8f4qz";

    function shouldIgnore(event) {
        const target = event.target;
        const tag = target?.tagName;

        return (
            event.repeat ||
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            target?.isContentEditable
        );
    }

    function registerR(shortcuts) {
        if (shortcuts.rRegistered) return;
        shortcuts.rRegistered = true;
        shortcuts.rVisible = false;

        window.TransforkNewMAR?.register?.({
            key: ownerKey,
            creator: "Brenda",
            purpose: "TransforkNew R shortcut toggles the UI test overlay.",
            timestamp: 2607071200,
            parent: "TransforkNew/INPUT/SHORTCUTS/registerR.js",
            on: true
        });

        window.addEventListener(
            "keydown",
            event => {
                if (window.TransforkNewMAR && !window.TransforkNewMAR.isOn(ownerKey)) return;
                if (shouldIgnore(event)) return;
                if (event.key?.toLowerCase() !== "r") return;

                event.preventDefault();
                event.stopPropagation();

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
            },
            true
        );
    }

    api.INPUT.SHORTCUTS.registerR = registerR;
})();
