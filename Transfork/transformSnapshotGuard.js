window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function patchSnapshotLayer260705_TG7M4Q() {
        if (!api.snapshotLayer || api.snapshotLayer.__transformGuardPatched) return;

        const originalMakeSnapshot = api.snapshotLayer.makeSnapshot;
        if (typeof originalMakeSnapshot !== "function") return;

        api.snapshotLayer.makeSnapshot = function (...args) {
            const snapshot = originalMakeSnapshot.apply(this, args);

            if (snapshot) {
                snapshot.style.overflow = "hidden";
                snapshot.style.transformOrigin = "50% 50%";
                snapshot.dataset.transforkDrawableSpace = "true";
            }

            return snapshot;
        };

        api.snapshotLayer.__transformGuardPatched = true;
    }

    function start260705_ST8N2K() {
        patchSnapshotLayer260705_TG7M4Q();
    }

    start260705_ST8N2K();

    api.registerModule260705_NS8Q2M("transformSnapshotGuard", {
        patch: patchSnapshotLayer260705_TG7M4Q
    });
})();
