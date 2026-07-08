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

        const handler = event => {
            if (window.TransforkNewMAR && !window.TransforkNewMAR.isOn(ownerKey)) return false;
            if (shouldIgnore(event)) return false;
            if (event.ctrlKey || event.metaKey || event.altKey) return false;
            const key = event.key?.toLowerCase?.();
            if (key !== "r") return false;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            const uiReady = api.UI?.elements?.boundingBox && api.UI?.elements?.BOUNDINGBOX;
            if (uiReady) {
                toggleR();
            } else {
                window.__TransforkNewPendingR = true;
            }
            return true;
        };

        if (window.KEY && typeof window.KEY.register === "function") {
            window.KEY.register(handler);
        } else {
            window.addEventListener(
                "keydown",
                event => {
                    handler(event);
                },
                true
            );
        }

        // If there was a pending R key before modules loaded, consume when UI is ready
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
