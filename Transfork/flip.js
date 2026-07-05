window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const flipModule260705_FL3C9P = {
        horizontal(target) {
            api.transformOps.flipHorizontal(target);
        },

        vertical(target) {
            api.transformOps.flipVertical(target);
        },

        reset(target) {
            if (!target) return;
            api.transformOps.setDirection(target, 90);
            api.transformOps.setSize(target, 100);
            api.transformOps.setAlpha(target, 100);
        }
    };

    api.registerModule260705_NS8Q2M("flip", flipModule260705_FL3C9P);
})();
