window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.state.js.module", file: "TransforkNew/SYSTEM/REGISTRY/state.js", functionName: "module", purpose: "local process member registration for module", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const state = window.TransforkNew.SYSTEM.REGISTRY.state || {};

    state.records = state.records || {};
    state.byPurpose = state.byPurpose || {};
    state.byFile = state.byFile || {};
    state.loadedFiles = state.loadedFiles || window.__TransforkNewLoadedFiles || [];
    state.suspects = state.suspects || [];
    state.duplicates = state.duplicates || [];

    window.__TransforkNewLoadedFiles = state.loadedFiles;
    window.TransforkNew.SYSTEM.REGISTRY.state = state;
})();
