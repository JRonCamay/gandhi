window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    api.version = api.version || "0.1";
    api.modules = api.modules || Object.create(null);

    api.registerModule260705_NS8Q2M = function (name, module) {
        if (!name || !module) return module;
        api.modules[name] = module;
        api[name] = module;
        return module;
    };
})();
