window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const mathModule260705_MT2Q7V = {
        normalizeDirection(deg) {
            while (deg > 180) deg -= 360;
            while (deg <= -180) deg += 360;
            return deg;
        },

        clamp(value, min, max) {
            return Math.max(min, Math.min(max, value));
        },

        centerOfBounds(bounds) {
            if (!bounds) return { x: 0, y: 0 };
            return {
                x: (bounds.left + bounds.right) / 2,
                y: (bounds.top + bounds.bottom) / 2
            };
        },

        offsetBounds(bounds, dx, dy) {
            return {
                left: bounds.left + dx,
                right: bounds.right + dx,
                top: bounds.top + dy,
                bottom: bounds.bottom + dy
            };
        }
    };

    api.registerModule260705_NS8Q2M("math", mathModule260705_MT2Q7V);
})();
