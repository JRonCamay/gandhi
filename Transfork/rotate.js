window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const rotateModule260705_RT7H2W = {
        session: null,

        start(target, centerX, centerY, event) {
            if (!target || !event) return null;

            this.session = {
                target,
                centerX,
                centerY,
                startDirection: target.direction || 90,
                startAngle: Math.atan2(
                    event.clientY - centerY,
                    event.clientX - centerX
                )
            };

            api.state.setActiveTool("rotate");
            api.state.setFlag("rotating", true);
            return this.session;
        },

        apply(event) {
            const session = this.session;
            if (!session || !event) return;

            const angle = Math.atan2(
                event.clientY - session.centerY,
                event.clientX - session.centerX
            );

            const delta = (angle - session.startAngle) * 180 / Math.PI;
            api.transformOps.setDirection(
                session.target,
                api.math.normalizeDirection(session.startDirection + delta)
            );
        },

        finish(commit) {
            if (!this.session) return;

            if (!commit) {
                api.transformOps.setDirection(
                    this.session.target,
                    this.session.startDirection
                );
            }

            this.session = null;
            api.state.clearInteraction();
        }
    };

    api.registerModule260705_NS8Q2M("rotate", rotateModule260705_RT7H2W);
})();
