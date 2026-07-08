window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.LOAD = window.TransforkNew.LOAD || {};

(function () {
    "use strict";

    const api = window.TransforkNew.LOAD;
    const DEFAULT_BASE = "http://localhost:8000/gandhi/TransforkNew/";

    const state = api.state || {
        managers: {},
        activeRuns: {},
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

    function stationLabel(file) {
        const clean = cleanFile(file);
        return clean.split("/").pop() || clean;
    }

    function branchText(branch, station) {
        const parts = (branch || []).slice();
        if (station && station.file) parts.push(stationLabel(station.file));
        if (station && station.manager) parts.push(station.manager);
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
            index: 0,
            status: "defined",
            parent: null,
            branch: [id],
            error: null
        };
        return state.managers[id];
    }

    function getManager(id) {
        const manager = state.managers[String(id || "").toUpperCase()];
        if (!manager) throw new Error("Missing manager: " + id);
        return manager;
    }

    function registerLoadedSource(file, source) {
        const existing = state.loadedSources.find(record => record.name === file);
        if (existing) {
            existing.text = source;
            existing.registered = false;
            return;
        }
        state.loadedSources.push({ name: file, text: source, registered: false });
    }

    function flushRegistry() {
        const registerModuleFunctions = window.TransforkNew?.SYSTEM?.REGISTRY?.registerModuleFunctions;
        if (typeof registerModuleFunctions === "function") {
            for (const record of state.loadedSources) {
                if (record.registered) continue;
                registerModuleFunctions(record.name, record.text);
                record.registered = true;
            }
        }
    }

    async function fetchSource(file, manager) {
        const response = await fetch(sourceUrl(file, state.token, manager.base), { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status + " loading " + file);
        return response.text();
    }

    async function loadFile(manager, station) {
        const file = cleanFile(station.file);
        const path = branchText(manager.branch, station);

        try {
            console.log("[TN LOAD]", path);
            const source = await fetchSource(file, manager);
            Function(source + "\n//# sourceURL=TransforkNew/" + file + "?v=" + encodeURIComponent(state.token))();
            registerLoadedSource(file, source);
            window.TransforkNew?.SYSTEM?.REGISTRY?.markLoaded?.(file);
            flushRegistry();
            loaded(file);
            console.log("[TN LOADED]", path);
            return { status: "loaded", file, branch: path };
        } catch (error) {
            failed(file, error, manager, station);
            throw error;
        }
    }

    async function runChild(parent, station) {
        const child = getManager(station.manager);
        child.parent = parent.id;
        child.branch = parent.branch.concat(child.id);
        await runManager(child.id, child.branch);
        return { status: "loaded", manager: child.id, branch: child.branch.join(" > ") };
    }

    async function loadNext(id) {
        const manager = getManager(id);
        const station = manager.stations[manager.index];

        if (!station) {
            manager.status = "complete";
            console.log("[TN LOAD COMPLETE]", manager.branch.join(" > "));
            return { status: "complete", manager: manager.id, branch: manager.branch.join(" > ") };
        }

        const currentIndex = manager.index;
        const stationPath = branchText(manager.branch, station);
        console.log("[TN LOAD STATION]", stationPath, { index: currentIndex });

        if (station.file) {
            await loadFile(manager, station);
        } else if (station.manager) {
            await runChild(manager, station);
        } else {
            const error = new Error("Invalid station entry at index " + currentIndex + " in " + manager.id);
            failed("station[" + currentIndex + "]", error, manager, station);
            throw error;
        }

        manager.index += 1;
        return loadNext(manager.id);
    }

    async function runManager(id, branch) {
        const manager = getManager(id);
        manager.index = 0;
        manager.status = "running";
        manager.error = null;
        manager.branch = branch && branch.length ? branch.slice() : [manager.id];

        try {
            console.groupCollapsed("[TN LOAD MANAGER] " + manager.branch.join(" > "));
            const result = await loadNext(manager.id);
            console.groupEnd();
            return result;
        } catch (error) {
            manager.status = "failed";
            manager.error = error;
            try { console.groupEnd(); } catch {}
            throw error;
        }
    }

    function loaded(file) {
        return {
            status: "loaded",
            file: cleanFile(file),
            at: Date.now()
        };
    }

    function failed(file, error, manager, station) {
        const activeManager = manager || Object.values(state.managers).find(item => item.status === "running") || null;
        const branch = activeManager ? branchText(activeManager.branch, station || { file }) : cleanFile(file);
        const report = {
            status: "failed",
            file: cleanFile(file),
            branch,
            station,
            message: error?.message || String(error),
            error
        };

        state.failed = true;
        console.error("[TN LOAD FAILED] " + branch, report);

        if (activeManager && activeManager.parent) {
            let parent = state.managers[activeManager.parent];
            while (parent) {
                parent.status = "failed";
                parent.error = error;
                parent = parent.parent ? state.managers[parent.parent] : null;
            }
        }

        return report;
    }

    function resetRun(token) {
        state.token = token || String(Date.now());
        state.failed = false;
        state.loadedSources = [];
        for (const manager of Object.values(state.managers)) {
            manager.index = 0;
            manager.status = "defined";
            manager.error = null;
            manager.parent = null;
            manager.branch = [manager.id];
        }
    }

    api.base = normalizeBase(api.base || DEFAULT_BASE);
    api.state = state;
    api.defineManager = defineManager;
    api.runManager = runManager;
    api.loadNext = loadNext;
    api.loaded = loaded;
    api.failed = failed;
    api.resetRun = resetRun;
})();
