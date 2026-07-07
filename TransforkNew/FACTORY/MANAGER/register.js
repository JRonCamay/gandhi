window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.FACTORY = window.TransforkNew.FACTORY || {};
window.TransforkNew.FACTORY.MANAGER = window.TransforkNew.FACTORY.MANAGER || {};

(function () {
    "use strict";

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
