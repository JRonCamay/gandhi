window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};

(function () {
    "use strict";

    const version = window.TransforkNewLoader?.version || window.TransforkNew?.VERSION || ["1", "2", "4-dev"].join(".");

    window.TransforkNew.VERSION = version;
    window.TransforkNew.SYSTEM.version = {
        value: version,
        label: "TransforkNew v" + version
    };
})();
