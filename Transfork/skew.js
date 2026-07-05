window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const skewModule260705_SK5N2L = {
        session: null,

        start(target, event) {
            const drawable = api.drawable.getDrawable(target);
            if (!target || !drawable || !event) return null;

            this.session = {
                target,
                drawable,
                startMouseX: event.clientX,
                startMouseY: event.clientY,
                shearX: 0,
                shearY: 0
            };

            api.state.setActiveTool("skew");
            api.state.setFlag("skewing", true);
            return this.session;
        },

        apply(event) {
            const session = this.session;
            if (!session || !event) return;

            session.shearX = (event.clientX - session.startMouseX) / 200;
            session.shearY = (event.clientY - session.startMouseY) / 200;

            if (typeof session.drawable.setTransformDirty === "function") {
                session.drawable.setTransformDirty();
            }

            api.vm.requestRedraw(session.target);
        },

        finish() {
            this.session = null;
            api.state.clearInteraction();
        }
    };

    api.registerModule260705_NS8Q2M("skew", skewModule260705_SK5N2L);
})();
