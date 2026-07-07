window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY || {};

(function () {
    "use strict";

    function register(meta) {
        const state = window.TransforkNew.SYSTEM.REGISTRY.state;
        if (!state || !meta || !meta.id) return null;

        const record = {
            id: meta.id,
            file: meta.file || "",
            functionName: meta.functionName || meta.id,
            purpose: meta.purpose || "unlisted purpose",
            manager: meta.manager || "unmanaged",
            station: meta.station || 0,
            line: meta.line || meta.manager || "unmanaged",
            owner: meta.owner || "TransforkNew",
            registeredAt: Date.now()
        };

        const existing = state.records[record.id];
        if (existing && state.debugEnabled) {
            console.warn("[TransforkNew REGISTRY] duplicate id", { existing, record });
        }

        state.records[record.id] = record;

        if (record.file) {
            state.byFile[record.file] = state.byFile[record.file] || [];
            state.byFile[record.file].push(record);
        }

        if (record.purpose) {
            state.byPurpose[record.purpose] = state.byPurpose[record.purpose] || [];
            state.byPurpose[record.purpose].push(record);
            if (state.byPurpose[record.purpose].length > 1 && state.debugEnabled) {
                console.warn("[TransforkNew REGISTRY] duplicate purpose", {
                    purpose: record.purpose,
                    records: state.byPurpose[record.purpose]
                });
            }
        }

        return record;
    }

    function markLoaded(file) {
        const state = window.TransforkNew.SYSTEM.REGISTRY.state;
        if (!state || !file) return;
        if (!state.loadedFiles.includes(file)) state.loadedFiles.push(file);
    }

    window.TransforkNew.SYSTEM.REGISTRY.register = register;
    window.TransforkNew.SYSTEM.REGISTRY.markLoaded = markLoaded;
})();
