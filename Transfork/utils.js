window.Transfork = window.Transfork || {};
window.Transfork.utils = {
    clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }
};
