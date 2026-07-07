window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY || {};

(function () {
    "use strict";

    function findByPurpose(purpose) {
        return window.TransforkNew.SYSTEM.REGISTRY.state?.byPurpose?.[purpose] || [];
    }

    function findByFile(file) {
        return window.TransforkNew.SYSTEM.REGISTRY.state?.byFile?.[file] || [];
    }

    function list() {
        return Object.values(window.TransforkNew.SYSTEM.REGISTRY.state?.records || {});
    }

    window.TransforkNew.SYSTEM.REGISTRY.findByPurpose = findByPurpose;
    window.TransforkNew.SYSTEM.REGISTRY.findByFile = findByFile;
    window.TransforkNew.SYSTEM.REGISTRY.list = list;
})();
