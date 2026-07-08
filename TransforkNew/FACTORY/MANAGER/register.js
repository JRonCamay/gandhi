window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.FACTORY.MANAGER.register.js.register", file: "TransforkNew/FACTORY/MANAGER/register.js", functionName: "register", purpose: "local process member registration for register", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    function register(meta) {
        const manager = window.TransforkNew.FACTORY.MANAGER;
        const line = manager.create?.(meta.line || "MAIN", { maxStation: meta.maxStation || meta.station || 0 });
        if (!line || !meta.station) return null;

        line.stations[meta.station] = {
            id: meta.id,
            station: meta.station,
            file: meta.file,
            functionName: meta.functionName,
            purpose: meta.purpose
        };

        window.TransforkNew.SYSTEM?.REGISTRY?.register?.({
            ...meta,
            manager: meta.line || "MAIN"
        });

        return line.stations[meta.station];
    }

    window.TransforkNew.FACTORY.MANAGER.register = register;
})();
