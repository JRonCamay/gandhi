window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const stateModule260705_ST8R4M = {
        transformMode: false,
        activeTool: null,
        activeTarget: null,
        flags: Object.create(null),

        setTransformMode(value) {
            this.transformMode = !!value;
        },

        setActiveTool(name) {
            this.activeTool = name || null;
        },

        setActiveTarget(target) {
            this.activeTarget = target || null;
        },

        setFlag(name, value) {
            if (!name) return;
            this.flags[name] = !!value;
        },

        isFlagOn(name) {
            return !!this.flags[name];
        },

        clearInteraction() {
            this.activeTool = null;
            this.setFlag("dragging", false);
            this.setFlag("resizing", false);
            this.setFlag("rotating", false);
            this.setFlag("skewing", false);
            this.setFlag("alphaDragging", false);
        }
    };

    api.registerModule260705_NS8Q2M("state", stateModule260705_ST8R4M);
})();
