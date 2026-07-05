window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    const legacyBridgeModule260705_LB2V8C = {
        legacyFile: "TransformBoxTool.js",
        legacyProvides: [
            "overlay DOM",
            "handle DOM",
            "selection box refresh loop",
            "asset bake",
            "current skew bake path"
        ],
        modularProvides: [
            "vm access",
            "coordinate conversion",
            "selection box placement",
            "snapshot drag",
            "state",
            "drawable helpers",
            "math helpers",
            "transform operations",
            "resize owner",
            "rotate owner",
            "alpha owner",
            "flip owner",
            "skew session shell"
        ],

        report() {
            return {
                legacyFile: this.legacyFile,
                legacyProvides: this.legacyProvides.slice(),
                modularProvides: this.modularProvides.slice()
            };
        }
    };

    api.registerModule260705_NS8Q2M("legacyBridge", legacyBridgeModule260705_LB2V8C);
})();
