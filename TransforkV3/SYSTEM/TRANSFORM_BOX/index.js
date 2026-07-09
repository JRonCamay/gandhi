// TransforkV3 TRANSFORM_BOX system
(function () {
    "use strict";

    const app = window.TransforkV3 = window.TransforkV3 || {};
    const runtime = app.runtime = app.runtime || {};

    const api = {
        name: "TRANSFORM_BOX",
        started: false,
        visible: false
    };

    function getUI() {
        return app.systems && app.systems.UI;
    }

    function refresh() {
        const render = app.systems && app.systems.RENDER;
        if (render && typeof render.refresh === "function") render.refresh();
    }

    api.show = function () {
        const ui = getUI();
        if (!ui || typeof ui.show !== "function") return false;
        ui.show();
        api.visible = true;
        runtime.toolboxVisible = true;
        refresh();
        return true;
    };

    api.hide = function () {
        const ui = getUI();
        if (!ui || typeof ui.hide !== "function") return false;
        ui.hide();
        api.visible = false;
        runtime.toolboxVisible = false;
        return true;
    };

    api.toggle = function () {
        if (runtime.toolboxVisible || api.visible) return api.hide();
        return api.show();
    };

    api.startSession = function (data) {
        runtime.activeTransform = data || {};
        return runtime.activeTransform;
    };

    api.endSession = function () {
        runtime.activeTransform = null;
    };

    api.start = function () {
        if (api.started) return;
        api.started = true;
        runtime.toolboxVisible = !!runtime.toolboxVisible;
    };

    if (typeof app.registerSystem === "function") app.registerSystem("TRANSFORM_BOX", api);
})();
