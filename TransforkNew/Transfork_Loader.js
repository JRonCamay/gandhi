// ==UserScript==
// @name         Gandhi TransforkNew Loader
// @namespace    http://tampermonkey.net/
// @version      1.3.0-manager-line-loader
// @description  Loads TransforkNew through manager-owned factory-line loading
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const VERSION = ["1", "3", "0-manager-line-loader"].join(".");
    const base = "http://localhost:8000/gandhi/TransforkNew/";
    const managerDefinitions = [
        "LOAD/MANAGERS/system.js",
        "LOAD/MANAGERS/key.js",
        "LOAD/MANAGERS/vm.js",
        "LOAD/MANAGERS/tools.js",
        "LOAD/MANAGERS/factory.js",
        "LOAD/MANAGERS/input.js",
        "LOAD/MANAGERS/uiBoundingBox.js",
        "LOAD/MANAGERS/scaleButtonDrag.js",
        "LOAD/MANAGERS/scaleButtonEvents.js",
        "LOAD/MANAGERS/scaleButton.js",
        "LOAD/MANAGERS/moveButtonDrag.js",
        "LOAD/MANAGERS/moveButtonEvents.js",
        "LOAD/MANAGERS/moveButton.js",
        "LOAD/MANAGERS/uiButtons.js",
        "LOAD/MANAGERS/ui.js",
        "LOAD/MANAGERS/main.js"
    ];

    let loading = false;

    window.TransforkNew = window.TransforkNew || {};
    window.TransforkNew.__pendingRegistryEntries = window.TransforkNew.__pendingRegistryEntries || [];
    window.TransforkNew.registerProcessMember = function registerProcessMember(meta) {
        const registry = window.TransforkNew?.SYSTEM?.REGISTRY;
        if (registry && typeof registry.register === "function") return registry.register(meta);
        if (meta && meta.id) window.TransforkNew.__pendingRegistryEntries.push(meta);
        return null;
    };
    window.TransforkNew.VERSION = VERSION;

    window.TransforkNewLoader = {
        version: VERSION,
        hotReload
    };

    function cacheToken() {
        return VERSION + "-" + Date.now();
    }

    function showToast(message) {
        const old = document.querySelector("#transfork-new-loader-toast");
        if (old) old.remove();

        const toast = document.createElement("div");
        toast.id = "transfork-new-loader-toast";
        toast.textContent = message;
        Object.assign(toast.style, {
            position: "fixed",
            right: "12px",
            bottom: "12px",
            zIndex: "2147483647",
            background: "rgba(0, 162, 255, 0.95)",
            color: "white",
            padding: "6px 10px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: "bold",
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            pointerEvents: "none"
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 1800);
    }

    function cleanupDOM() {
        ["#transfork-new-bounding-box", "#transfork-new-loader-toast"].forEach(selector => {
            document.querySelectorAll(selector).forEach(node => node.remove());
        });
    }

    function cleanupRuntime() {
        cleanupDOM();
        if (window.KEY && typeof window.KEY.destroy === "function") window.KEY.destroy();
        window.KEY = null;
        window.__TransforkNewLoader = false;
        window.TransforkNew = window.TransforkNew || {};
        window.TransforkNew.VERSION = VERSION;
        window.TransforkNew.__pendingRegistryEntries = [];
    }

    async function executeLocalFile(file, token) {
        const url = base + file + "?v=" + encodeURIComponent(token);
        console.log("[TN LOADER] bootstrap", file);
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status + " loading " + file);
        const source = await response.text();
        Function(source + "\n//# sourceURL=TransforkNew/" + file + "?v=" + encodeURIComponent(token))();
        return { status: "done", file };
    }

    async function loadDefinitions(token) {
        await executeLocalFile("LOAD/engine.js", token);
        window.TransforkNew.LOAD.base = base;
        window.TransforkNew.LOAD.resetRun(token);

        for (const file of managerDefinitions) {
            await executeLocalFile(file, token);
        }
    }

    async function afterMainComplete() {
        window.TransforkNew?.INPUT?.keyboard?.init?.();
        window.TransforkNew?.INPUT?.shortcuts?.init?.();
        window.KEY?.setEnabled?.(true);
        window.TransforkNew?.SYSTEM?.REGISTRY?.rollcall?.();

        console.log("[TN LOADER] MAIN complete; KEY enabled", {
            registryCount: window.KEY?.registry?.length || window.KEY?.shortcuts?.length || 0,
            inputKeyboard: window.TransforkNew?.INPUT?.keyboard,
            inputShortcuts: window.TransforkNew?.INPUT?.shortcuts
        });
    }

    async function loadAll(reason) {
        if (loading) return;
        loading = true;

        try {
            if (window.__TransforkNewLoader && reason !== "hot-reload") return;
            window.__TransforkNewLoader = true;

            const token = cacheToken();
            console.log("[TN LOADER] manager-line load begin", { VERSION, reason, base, token });

            await loadDefinitions(token);
            await window.TransforkNew.LOAD.runManager("MAIN");
            await afterMainComplete();

            console.log("TransforkNew loader active " + VERSION + " (" + reason + ").");
            showToast("TransforkNew " + VERSION + " loaded");
        } finally {
            loading = false;
        }
    }

    async function hotReload() {
        if (loading) return;
        showToast("Reloading TransforkNew " + VERSION + "...");
        console.log("TransforkNew hot reload requested " + VERSION + ".");
        cleanupRuntime();
        await loadAll("hot-reload");
    }

    loadAll("startup").catch(error => console.error("TransforkNew loader failed", error));
})();
