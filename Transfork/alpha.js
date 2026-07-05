window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const alphaModule260705_AL8D6Q = {
        session: null,

        get(target) {
            return api.transformOps.getAlpha(target);
        },

        set(target, value) {
            api.transformOps.setAlpha(target, value);
        },

        start(target, event) {
            if (!target || !event) return null;

            this.session = {
                target,
                startMouseX: event.clientX,
                startValue: this.get(target)
            };

            api.state.setActiveTool("alpha");
            api.state.setFlag("alphaDragging", true);
            return this.session;
        },

        apply(event) {
            const session = this.session;
            if (!session || !event) return;

            const delta = Math.floor((event.clientX - session.startMouseX) / 2);
            this.set(session.target, api.math.clamp(session.startValue + delta, 0, 100));
        },

        finish() {
            this.session = null;
            api.state.clearInteraction();
        }
    };

    api.registerModule260705_NS8Q2M("alpha", alphaModule260705_AL8D6Q);
})();
