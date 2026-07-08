window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.SYSTEM = window.TransforkNew.SYSTEM || {};
window.TransforkNew.SYSTEM.REGISTRY = window.TransforkNew.SYSTEM.REGISTRY || {};

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.register.js.register", file: "TransforkNew/SYSTEM/REGISTRY/register.js", functionName: "register", purpose: "local process member registration for register", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.register.js.inferManager", file: "TransforkNew/SYSTEM/REGISTRY/register.js", functionName: "inferManager", purpose: "local process member registration for inferManager", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.register.js.registerModuleFunctions", file: "TransforkNew/SYSTEM/REGISTRY/register.js", functionName: "registerModuleFunctions", purpose: "local process member registration for registerModuleFunctions", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.register.js.flushPendingRegistryEntries", file: "TransforkNew/SYSTEM/REGISTRY/register.js", functionName: "flushPendingRegistryEntries", purpose: "local process member registration for flushPendingRegistryEntries", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.SYSTEM.REGISTRY.register.js.markLoaded", file: "TransforkNew/SYSTEM/REGISTRY/register.js", functionName: "markLoaded", purpose: "local process member registration for markLoaded", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

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



    function inferManager(file) {
        if (file.includes("/KEY/")) return "KEY";
        if (file.includes("/MOVE") || file.includes("MOVEBUTTON")) return "MOVE";
        if (file.includes("/ROTATE") || file.includes("ROTATEBUTTON")) return "ROTATE";
        if (file.includes("/SCALE") || file.includes("SCALEBUTTON") || file.includes("SIZE")) return "SCALE";
        if (file.includes("/REFRESH/") || file.includes("/BOUNDINGBOX/REFRESH/")) return "RENDER";
        if (file.includes("/VM/")) return "VM";
        if (file.includes("/UI/")) return "UI";
        if (file.includes("/FACTORY/")) return "MAIN";
        if (file.includes("/INPUT/")) return "KEY";
        return "MAIN";
    }

    function registerModuleFunctions(file, source) {
        if (!file || !source) return [];
        const registry = window.TransforkNew.SYSTEM.REGISTRY;
        const found = [];
        const seen = new Set();
        const patterns = [
            /function\s+([A-Za-z_$][\w$]*)\s*\(/g,
            /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?(?:function\s*)?\(/g,
            /([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?function\s*\(/g
        ];

        for (const pattern of patterns) {
            let match;
            while ((match = pattern.exec(source))) {
                const functionName = match[1];
                if (!functionName || seen.has(functionName)) continue;
                if (["if", "for", "while", "switch", "catch", "function"].includes(functionName)) continue;
                seen.add(functionName);
                found.push(registry.register({
                    id: inferManager(file) + ".auto." + file.replace(/[^A-Za-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "") + "." + functionName,
                    file: "TransforkNew/" + file.replace(/^TransforkNew\//, ""),
                    functionName,
                    purpose: "auto rollcall registration for " + functionName,
                    manager: inferManager(file),
                    station: 0,
                    line: inferManager(file),
                    owner: "TransforkNew auto rollcall"
                }));
            }
        }

        if (!found.length) {
            found.push(registry.register({
                id: inferManager(file) + ".auto." + file.replace(/[^A-Za-z0-9]+/g, ".").replace(/^\.+|\.+$/g, ".module"),
                file: "TransforkNew/" + file.replace(/^TransforkNew\//, ""),
                functionName: "module",
                purpose: "module loaded without named process member",
                manager: inferManager(file),
                station: 0,
                line: inferManager(file),
                owner: "TransforkNew auto rollcall"
            }));
        }

        return found.filter(Boolean);
    }



    function flushPendingRegistryEntries() {
        const pending = window.TransforkNew.__pendingRegistryEntries || [];
        window.TransforkNew.__pendingRegistryEntries = [];
        for (const meta of pending) register(meta);
    }

    function markLoaded(file) {
        const state = window.TransforkNew.SYSTEM.REGISTRY.state;
        if (!state || !file) return;
        if (!state.loadedFiles.includes(file)) state.loadedFiles.push(file);
    }

    window.TransforkNew.SYSTEM.REGISTRY.register = register;
    window.TransforkNew.SYSTEM.REGISTRY.registerModuleFunctions = registerModuleFunctions;
    window.TransforkNew.SYSTEM.REGISTRY.markLoaded = markLoaded;
    flushPendingRegistryEntries();
})();
