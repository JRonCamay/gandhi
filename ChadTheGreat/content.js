window.Chad = window.Chad || {};

(function () {
    "use strict";

    if (window.__ChadTheGreatExtensionStarted) {
        return;
    }

    window.__ChadTheGreatExtensionStarted = true;

    function startWhenReady() {
        if (
            window.Chad &&
            window.Chad.ui &&
            typeof window.Chad.ui.start === "function"
        ) {
            window.Chad.ui.start();

            if (
                window.Chad.bridge &&
                typeof window.Chad.bridge.groupCurrentTab === "function"
            ) {
                window.Chad.bridge.groupCurrentTab().catch(() => {});
            }

            return;
        }

        setTimeout(startWhenReady, 250);
    }

    startWhenReady();
})();
