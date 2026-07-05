window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const resizeModule260705_RS4K7D = {
        session: null,

        start(target, mode, event) {
            const drawable = api.drawable.getDrawable(target);
            if (!target || !drawable) return null;

            this.session = {
                target,
                drawable,
                mode: mode || "uniform",
                startMouseX: event ? event.clientX : 0,
                startMouseY: event ? event.clientY : 0,
                startScale: drawable.scale ? drawable.scale.slice() : [100, 100],
                startSize: target.size || 100
            };

            api.state.setActiveTool("resize");
            api.state.setFlag("resizing", true);
            return this.session;
        },

        apply(deltaX, deltaY) {
            const session = this.session;
            if (!session) return;

            const scale = session.startScale.slice();
            const amount = session.mode === "height" ? deltaY : deltaX;
            const next = Math.max(0.01, Math.abs(scale[0]) + amount);

            if (session.mode === "height") {
                scale[1] = Math.sign(scale[1] || 1) * next;
            }
            else if (session.mode === "width") {
                scale[0] = Math.sign(scale[0] || 1) * next;
            }
            else {
                const ratio = next / Math.max(0.01, Math.abs(session.startScale[0] || 1));
                scale[0] = session.startScale[0] * ratio;
                scale[1] = session.startScale[1] * ratio;
            }

            api.drawable.setScale(session.target, scale);
            api.vm.requestRedraw(session.target);
        },

        finish(commit) {
            if (!this.session) return;

            if (!commit) {
                api.drawable.setScale(this.session.target, this.session.startScale);
                api.transformOps.setSize(this.session.target, this.session.startSize);
            }

            this.session = null;
            api.state.clearInteraction();
        }
    };

    api.registerModule260705_NS8Q2M("resize", resizeModule260705_RS4K7D);
})();
