window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const mainModule260705_MN4R8C = {
        started: false,

        start() {
            if (this.started) return;
            if (!api.vm || !api.coords || !api.selectionBox || !api.snapshotDrag) {
                console.error("Transfork modules missing.");
                return;
            }

            api.snapshotDrag.bind();
            this.started = true;
        }
    };

    api.registerModule260705_NS8Q2M("main", mainModule260705_MN4R8C);
    mainModule260705_MN4R8C.start();
})();
