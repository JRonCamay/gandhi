window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.INPUT = window.TransforkNew.INPUT || {};
window.TransforkNew.INPUT.SHORTCUTS = window.TransforkNew.INPUT.SHORTCUTS || {};

(function () {
    "use strict";

    const FILE = "TransforkNew/INPUT/SHORTCUTS/registerR.js";
    const api = window.TransforkNew;
    const ownerKey = "transforkNew.rShortcut260707_a8f4qz";

    api.SYSTEM?.REGISTRY?.register?.({
        id: "INPUT.SHORTCUTS.toggleR",
        file: FILE,
        functionName: "toggleR",
        purpose: "R key toggles TransforkNew transform overlay",
        manager: "KEY",
        station: 3
    });

    function debug(label, data) {
        api.SYSTEM?.debug?.log?.("R " + label, data);
    }

    function toggleR() {
        if (!api.KEY_MANAGER?.guard?.(3, FILE, "toggleR")) return;

        try {
            debug("toggle start");

            const shortcuts = api.INPUT?.shortcuts;
            const box = api.UI?.elements?.boundingBox;

            debug("shortcuts", shortcuts);
            debug("box before init", box);
            debug("vm state", api.SYSTEM?.VM?.state);

            box?.init?.();
            api.UI?.elements?.buttons?.init?.();

            debug("box after init", {
                hasBox: !!box,
                hasNode: !!box?.node,
                visible: box?.visible
            });

            if (!shortcuts) {
                api.SYSTEM?.debug?.warn?.("R shortcuts missing");
                return;
            }

            shortcuts.rVisible = !shortcuts.rVisible;
            debug("rVisible toggled", shortcuts.rVisible);

            if (shortcuts.rVisible) {
                debug("factory before run", api.FACTORY);
                const state = api.FACTORY?.run?.({ id: "transforkNew.r" });
                debug("factory after run", state);
                debug("box after factory", {
                    hasBox: !!state?.box,
                    visible: state?.box?.visible,
                    nodeDisplay: state?.box?.node?.style?.display,
                    target: state?.target,
                    drawable: state?.drawable,
                    bounds: state?.bounds,
                    vm: state?.vm
                });
                if (!state?.box?.visible) {
                    debug("box not visible, resetting rVisible false");
                    shortcuts.rVisible = false;
                }
                return;
            }

            debug("hide requested");
            api.UI?.elements?.BOUNDINGBOX?.hide?.(box);
        } catch (error) {
            api.KEY_MANAGER?.sleeper?.(error, FILE, "toggleR", 3);
        }
    }

    function registerR(shortcuts) {
        debug("register start", shortcuts);
        if (shortcuts.rRegistered) {
            debug("register skipped already registered");
            return;
        }
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
        debug("registered");

    }

    api.INPUT.SHORTCUTS.toggleR = toggleR;
    api.INPUT.SHORTCUTS.registerR = registerR;
})();
