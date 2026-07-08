window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.LOAD = window.TransforkNew.LOAD || {};

(function () {
    "use strict";

    const api = window.TransforkNew.LOAD;
    const DEFAULT_BASE = "http://localhost:8000/gandhi/TransforkNew/";

    const state = api.state || {
        managers: {},
        loadedSources: [],
        token: "",
        failed: false
    };

    function normalizeBase(base) {
        return String(base || DEFAULT_BASE).replace(/\/?$/, "/");
    }

    function cleanFile(file) {
        return String(file || "").replace(/^TransforkNew\//, "").replace(/^\/+/, "");
    }

    function fileLabel(file) {
        const clean = cleanFile(file);
        return clean.split("/").pop() || clean;
    }

    function pathText(path, station) {
        const parts = (path || []).slice();
        if (station?.manager) parts.push(String(station.manager).toUpperCase());
        if (station?.file) parts.push(fileLabel(station.file));
        return parts.join(" > ");
    }

    function sourceUrl(file, token, base) {
        return normalizeBase(base) + cleanFile(file) + "?v=" + encodeURIComponent(token || Date.now());
    }

    function defineManager(definition) {
        if (!definition || !definition.id) throw new Error("defineManager requires id");

        const id = String(definition.id).trim().toUpperCase();
        state.managers[id] = {
            id,
            base: normalizeBase(definition.base || api.base || DEFAULT_BASE),
            stations: Array.isArray(definition.stations) ? definition.stations.slice() : [],
            status: "defined",
            loaded: definition.loaded || loaded,
            failed: definition.failed || failed,
            done: definition.done || done,
            branch: [id],
            error: null
        };
        return state.managers[id];
    }

    function getManager(id) {
        const key = String(id || "").trim().toUpperCase();
        const manager = state.managers[key];
        if (!manager) throw new Error("Missing manager: " + id);
        return manager;
    }

    function registerLoadedSource(file, source) {
        const clean = cleanFile(file);
        const existing = state.loadedSources.find(record => record.name === clean);
        if (existing) {
            existing.text = source;
            existing.registered = false;
            return;
        }
        state.loadedSources.push({ name: clean, text: source, registered: false });
    }

    function flushRegistry() {
        const registerModuleFunctions = window.TransforkNew?.SYSTEM?.REGISTRY?.registerModuleFunctions;
        if (typeof registerModuleFunctions !== "function") return;

        for (const record of state.loadedSources) {
            if (record.registered) continue;
            registerModuleFunctions(record.name, record.text);
            record.registered = true;
        }
    }

    async function fetchSource(file, manager) {
        const response = await fetch(sourceUrl(file, state.token, manager.base), { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status + " loading " + file);
        return response.text();
    }

    async function loadFile(file, path, index, manager) {
        const clean = cleanFile(file);
        const branch = pathText(path, { file: clean });

        console.log("[TN LOAD FILE]", branch, { index, file: clean });

        const source = await fetchSource(clean, manager);
        Function(source + "\n//# sourceURL=TransforkNew/" + clean + "?v=" + encodeURIComponent(state.token))();

        registerLoadedSource(clean, source);
        window.TransforkNew?.SYSTEM?.REGISTRY?.markLoaded?.(clean);
        flushRegistry();

        console.log("[TN LOADED FILE]", branch, { index, file: clean });
        return { status: "loaded", file: clean, branch, index };
    }

    async function runManager(id, parentPath) {
        const manager = getManager(id);
        const path = (parentPath || []).concat(manager.id);

        manager.status = "running";
        manager.branch = path;
        manager.error = null;

        console.groupCollapsed("[TN ENTER MANAGER] " + path.join(" > "));

        try {
            for (let i = 0; i < manager.stations.length; i += 1) {
                const station = manager.stations[i];
                const stationBranch = pathText(path, station);

                console.log("[TN LOAD STATION]", stationBranch, { index: i });

                try {
                    if (station.manager) {
                        await runManager(station.manager, path);
                    } else if (station.file) {
                        await loadFile(station.file, path, i, manager);
                    } else {
                        throw new Error("Invalid station entry at index " + i + " in " + manager.id);
                    }

                    manager.loaded(station, i, path);
                } catch (error) {
                    manager.failed(station, i, path, error);
                    throw error;
                }
            }

            manager.status = "complete";
            manager.done(path);
            console.groupEnd();
            return { status: "complete", manager: manager.id, branch: path.join(" > ") };
        } catch (error) {
            manager.status = "failed";
            manager.error = error;
            try { console.groupEnd(); } catch {}
            throw error;
        }
    }

    function loadNext(id) {
        return runManager(id);
    }

    function loaded(station, index, path) {
        const report = {
            status: "loaded",
            station,
            index,
            branch: pathText(path, station),
            at: Date.now()
        };
        console.log("[TN STATION LOADED]", report.branch, report);
        return report;
    }

    function failed(station, index, path, error) {
        const branch = pathText(path, station);
        const report = {
            status: "failed",
            station,
            index,
            branch,
            file: station?.file ? cleanFile(station.file) : null,
            message: error?.message || String(error),
            error
        };

        state.failed = true;
        console.error("[TN LOAD FAILED] " + branch, report);
        return report;
    }

    function done(path) {
        const branch = (path || []).join(" > ");
        const report = {
            status: "complete",
            branch,
            at: Date.now()
        };
        console.log("[TN EXIT MANAGER]", branch, report);
        return report;
    }

    function resetRun(token) {
        state.token = token || String(Date.now());
        state.failed = false;
        state.loadedSources = [];

        for (const manager of Object.values(state.managers)) {
            manager.status = "defined";
            manager.branch = [manager.id];
            manager.error = null;
        }
    }

    api.base = normalizeBase(api.base || DEFAULT_BASE);
    api.state = state;
    api.defineManager = defineManager;
    api.runManager = runManager;
    api.loadNext = loadNext;
    api.loadFile = loadFile;
    api.loaded = loaded;
    api.failed = failed;
    api.done = done;
    api.resetRun = resetRun;
})();
