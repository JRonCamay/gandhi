(function () {
    "use strict";

    if (!window.KEY || typeof window.KEY.register !== "function") return;

    function requestHotReload() {
        let started = false;
        const pending = [];

        try {
            if (window.TransforkNewLoader?.hotReload) {
                const result = window.TransforkNewLoader.hotReload();
                started = true;
                if (result && typeof result.finally === "function") pending.push(result);
            } else {
                window.__TransforkNewPendingHotReload = true;
            }
        } catch (_) {}

        try {
            if (typeof window.TransforkHotReload === "function") {
                const result = window.TransforkHotReload();
                started = true;
                if (result && typeof result.finally === "function") pending.push(result);
            } else {
                window.__TransforkPendingHotReload = true;
            }
        } catch (_) {}

        if (pending.length) return Promise.allSettled(pending);
        return started;
    }

    window.KEY.register({
        id: "hotReload.altR",
        key: "r",
        alt: true,
        ctrl: false,
        shift: false,
        meta: false,
        run() {
            return requestHotReload();
        }
    });
})();
