window.Chad = window.Chad || {};

(function () {
    "use strict";

    const storage = {};

    function getChatKey() {
        const path = location.pathname || "/";
        const match = path.match(/\/c\/([^/?#]+)/);

        if (match) {
            return "chat-" + match[1];
        }

        return "path-" + path.replace(/[^a-z0-9_-]+/gi, "_");
    }

    function nowStamp() {
        return new Date().toLocaleString();
    }

    function loadJSON(key, fallback) {
        try {
            const value = localStorage.getItem(key);

            if (!value) {
                return fallback;
            }

            return JSON.parse(value) || fallback;
        }
        catch {
            return fallback;
        }
    }

    function saveJSON(key, value) {
        localStorage.setItem(
            key,
            JSON.stringify(value)
        );
    }

    const chatKey = getChatKey();

    const keys = {
        tasks: "gandhi_chad_tasks_v4:" + chatKey,
        roadmap: "gandhi_chad_roadmap_v4:" + chatKey,
        pins: "gandhi_chad_pins_v4:" + chatKey,
        notes: "gandhi_chad_notes_v5:" + chatKey,
        deletedTasks: "gandhi_chad_deleted_tasks_v2:" + chatKey,
        repoCache: "gandhi_chad_repo_cache_v4",
        openFolders: "gandhi_chad_open_folders_v2"
    };

    const state = {
        chatKey,
        activeTab: "tasks",
        activeProject: "ALL",
        minimized: false,
        repoTree: null,
        repoLoading: false,
        contextMenu: null,

        tasks: loadJSON(keys.tasks, []),
        roadmap: loadJSON(
            keys.roadmap,
            (window.Chad.data.defaultRoadmap || []).map(item => ({
                ...item,
                createdAt: nowStamp(),
                updatedAt: nowStamp()
            }))
        ),
        pins: loadJSON(keys.pins, []),
        notesText: localStorage.getItem(keys.notes) || "",
        deletedTaskIds: loadJSON(keys.deletedTasks, []),
        openFolders: loadJSON(keys.openFolders, {})
    };

    function saveTasks() {
        saveJSON(keys.tasks, state.tasks);
    }

    function saveRoadmap() {
        saveJSON(keys.roadmap, state.roadmap);
    }

    function savePins() {
        saveJSON(keys.pins, state.pins);
    }

    function saveNotes() {
        localStorage.setItem(
            keys.notes,
            state.notesText || ""
        );
    }

    function saveDeletedTasks() {
        saveJSON(
            keys.deletedTasks,
            state.deletedTaskIds
        );
    }

    function saveOpenFolders() {
        saveJSON(
            keys.openFolders,
            state.openFolders
        );
    }

    function rememberDeletedTask(id) {
        if (!state.deletedTaskIds.includes(id)) {
            state.deletedTaskIds.push(id);
            saveDeletedTasks();
        }
    }

    function isDeletedTaskId(id) {
        return state.deletedTaskIds.includes(id);
    }

    function resetDeletedTasks() {
        state.deletedTaskIds = [];
        saveDeletedTasks();
    }

    function loadRepoCache() {
        return loadJSON(keys.repoCache, null);
    }

    function saveRepoCache(value) {
        saveJSON(keys.repoCache, value);
    }

    storage.getChatKey = getChatKey;
    storage.nowStamp = nowStamp;
    storage.loadJSON = loadJSON;
    storage.saveJSON = saveJSON;
    storage.keys = keys;
    storage.state = state;
    storage.saveTasks = saveTasks;
    storage.saveRoadmap = saveRoadmap;
    storage.savePins = savePins;
    storage.saveNotes = saveNotes;
    storage.saveDeletedTasks = saveDeletedTasks;
    storage.saveOpenFolders = saveOpenFolders;
    storage.rememberDeletedTask = rememberDeletedTask;
    storage.isDeletedTaskId = isDeletedTaskId;
    storage.resetDeletedTasks = resetDeletedTasks;
    storage.loadRepoCache = loadRepoCache;
    storage.saveRepoCache = saveRepoCache;

    window.Chad.storage = storage;
})();
