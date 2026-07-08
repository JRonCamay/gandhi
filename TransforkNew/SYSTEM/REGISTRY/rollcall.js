window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.rollcall.js.rollcall", file: "TransforkNew/SYSTEM/REGISTRY/rollcall.js", functionName: "rollcall", purpose: "local process member registration for rollcall", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

function rollcall(options = {}) {
        const debug = window.TransforkNew.DEBUG || window.TransforkNew.SYSTEM?.debug;
        const registry = window.TransforkNew.SYSTEM.REGISTRY;
        const state = registry.state;
        const forced = options === true || options.force === true;

        if (!state) return { registered: [], suspects: [], duplicates: [] };

        if (!forced && !debug?.rollcallEnabled) {
            return {
                registered: Object.values(state.records || {}),
                suspects: state.suspects || [],
                duplicates: state.duplicates || [],
                skipped: true
            };
        }

        const loaded = Array.from(new Set(state.loadedFiles || window.__TransforkNewLoadedFiles || []));
        const registered = Object.values(state.records || {});
        const registeredFiles = new Set(registered.map(item => item.file).filter(Boolean));

        const suspects = loaded
            .filter(file => file.endsWith(".js"))
            .filter(file => !registeredFiles.has("TransforkNew/" + file) && !registeredFiles.has(file));

        const duplicates = Object.entries(state.byPurpose || {})
            .filter(([, records]) => records.length > 1)
            .map(([purpose, records]) => ({ purpose, records }));

        state.suspects = suspects;
        state.duplicates = duplicates;

        if (debug?.enabled) {
            console.group("[TransforkNew REGISTRY] ROLLCALL");
            console.log("registered", registered);
            console.warn("suspect files without function registration", suspects);
            console.warn("duplicate purposes", duplicates);
            console.groupEnd();
        }

        return { registered, suspects, duplicates, skipped: false };
    }

    window.TransforkNew.SYSTEM.REGISTRY.rollcall = rollcall;
})();
