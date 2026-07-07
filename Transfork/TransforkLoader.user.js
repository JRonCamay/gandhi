// ==UserScript==
// @name         Gandhi Transfork Modular Loader
// @namespace    http://tampermonkey.net/
// @version      1.2.1-dev
// @description  Loads modular Transfork files dynamically
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const VERSION = "1.2.1-dev";
    const base = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/Transfork/";
    const modules = [
        "namespace.js",
        "state.js",
        "vm.js",
        "coords.js",
        "drawable.js",
        "math.js",
        "selectionBox.js",
        "transformOps.js",
        "snapshotLayer.js",
        "orderFix.js",
        "pixelBounds.js",
        "transformSnapshotGuard.js",
        "overlayTop.js",
        "snapGuideOverlay.js",
        "snapshotDragPixel.js",
        "snapshotToolsPixel.js",
        "alpha.js",
        "flip.js",
        "skew.js",
        "legacyBridge.js",
        "main.js"
    ];

    let loading = false;

    window.GANDHI_TRANSFORK_VERSION = VERSION;
    window.GANDHI_TRANSFORK_MODULES = modules.slice();

    function cacheToken() {
        return VERSION + "-" + Date.now();
    }

    function ensureNamespace() {
        const api = window.Transfork = window.Transfork || {};
        api.version = VERSION;
        api.modules = api.modules || Object.create(null);

        if (typeof api.registerModule260705_NS8Q2M !== "function") {
            api.registerModule260705_NS8Q2M = function (name, module) {
                if (!name || !module) return module;
                api.modules[name] = module;
                api[name] = module;
                return module;
            };
        }

        return api;
    }

    function cleanupDOM() {
        [
            "#gandi-transform-box",
            "#transform-alpha-container",
            "#gandhi-transfork-hot-reload-toast"
        ].forEach(selector => {
            document.querySelectorAll(selector).forEach(node => node.remove());
        });

        document.querySelectorAll("[data-gandhi-transfork-runtime]").forEach(node => node.remove());
    }

    function cleanupRuntime() {
        cleanupDOM();
        window.__gandhiTransforkDynamicLoader = false;
        window.Transfork = {};
        ensureNamespace();
    }

    function showToast(message) {
        const old = document.querySelector("#gandhi-transfork-hot-reload-toast");
        if (old) old.remove();

        const toast = document.createElement("div");
        toast.id = "gandhi-transfork-hot-reload-toast";
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

    async function loadModule(name, token) {
        ensureNamespace();
        const url = base + name + "?v=" + token;
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch " + name + ": " + response.status);
        const source = await response.text();
        ensureNamespace();
        Function(source + "\n//# sourceURL=" + url)();
        ensureNamespace();
    }

    async function loadAll(reason) {
        if (loading) return;
        loading = true;

        try {
            if (window.__gandhiTransforkDynamicLoader && reason !== "hot-reload") return;
            window.__gandhiTransforkDynamicLoader = true;

            const token = cacheToken();
            for (const name of modules) await loadModule(name, token);

            console.log("Gandhi Transfork modular loader active " + VERSION + " (" + reason + ").");
            showToast("Transfork " + VERSION + " loaded");
        }
        finally {
            loading = false;
        }
    }

    async function hotReload() {
        if (loading) return;
        console.log("Gandhi Transfork hot reload requested " + VERSION + ".");
        showToast("Reloading Transfork " + VERSION + "...");
        cleanupRuntime();
        await loadAll("hot-reload");
    }

    function registerHotReloadShortcut() {
        if (window.__gandhiTransforkHotReloadShortcut) return;
        window.__gandhiTransforkHotReloadShortcut = true;

        window.addEventListener("keydown", event => {
            if (!event.ctrlKey || !event.shiftKey) return;
            if (!event.key || event.key.toLowerCase() !== "r") return;

            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();

            hotReload().catch(error => console.error("Gandhi Transfork hot reload failed", error));
        }, true);
    }

    registerHotReloadShortcut();
    ensureNamespace();
    loadAll("startup").catch(error => console.error("Gandhi Transfork loader failed", error));
})();
