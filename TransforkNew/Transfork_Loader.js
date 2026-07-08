// ==UserScript==
// @name         Gandhi TransforkNew Loader
// @namespace    http://tampermonkey.net/
// @version      1.2.8-factory-rollcall
// @description  Loads TransforkNew clean architecture modules
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    (function registerTransforkNewProcessMembers() {
        const register = window.TransforkNew?.registerProcessMember;
        if (typeof register !== "function") return;
        [
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.registerProcessMember", file: "TransforkNew/Transfork_Loader.js", functionName: "registerProcessMember", purpose: "local process member registration for registerProcessMember", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.cacheToken", file: "TransforkNew/Transfork_Loader.js", functionName: "cacheToken", purpose: "local process member registration for cacheToken", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.showToast", file: "TransforkNew/Transfork_Loader.js", functionName: "showToast", purpose: "local process member registration for showToast", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.cleanupDOM", file: "TransforkNew/Transfork_Loader.js", functionName: "cleanupDOM", purpose: "local process member registration for cleanupDOM", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.cleanupRuntime", file: "TransforkNew/Transfork_Loader.js", functionName: "cleanupRuntime", purpose: "local process member registration for cleanupRuntime", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.loadModule", file: "TransforkNew/Transfork_Loader.js", functionName: "loadModule", purpose: "local process member registration for loadModule", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.loadAll", file: "TransforkNew/Transfork_Loader.js", functionName: "loadAll", purpose: "local process member registration for loadAll", manager: "MAIN", station: 0 },
            { id: "MAIN.local.TransforkNew.Transfork.Loader.js.hotReload", file: "TransforkNew/Transfork_Loader.js", functionName: "hotReload", purpose: "local process member registration for hotReload", manager: "MAIN", station: 0 }
        ].forEach(register);
    })();

    const VERSION = ["1", "2", "8-factory-rollcall"].join(".");
    const base = "http://localhost:8000/gandhi/TransforkNew/";
    console.log("[TN LOADER] userscript started", { VERSION, base, url: location.href });
    const modules = [
        "KEY/KEY.js",
        "KEY/register.js",
        "KEY/shortcuts.js",
        "KEY/hotReload.js",
        "SYSTEM/MAR.js",
        "SYSTEM/version.js",
        "SYSTEM/debug.js",
        "DebugManager.js",
        "SYSTEM/REGISTRY/state.js",
        "SYSTEM/REGISTRY/register.js",
        "SYSTEM/REGISTRY/find.js",
        "SYSTEM/REGISTRY/rollcall.js",
        "SYSTEM/REGISTRY/index.js",
        "SYSTEM/VM/state.js",
        "SYSTEM/VM/find.js",
        "SYSTEM/VM/waitForVM.js",
        "SYSTEM/VM/get.js",
        "SYSTEM/VM/index.js",
        "SYSTEM/VM/getSelectedTarget.js",
        "SYSTEM/VM/getDrawable.js",
        "SYSTEM/VM/getCanvas.js",
        "SYSTEM/vm.js",
        "TOOLS/state.js",
        "TOOLS/activate.js",
        "TOOLS/line.js",
        "TOOLS/MOVE/state.js",
        "TOOLS/MOVE/01_begin.js",
        "TOOLS/MOVE/02_capture.js",
        "TOOLS/MOVE/03_simulation.js",
        "TOOLS/MOVE/04_transform.js",
        "TOOLS/MOVE/05_commit.js",
        "TOOLS/MOVE/interrupts/cancel.js",
        "TOOLS/ROTATE/state.js",
        "TOOLS/ROTATE/01_begin.js",
        "TOOLS/ROTATE/02_capture.js",
        "TOOLS/ROTATE/03_simulation.js",
        "TOOLS/ROTATE/04_transform.js",
        "TOOLS/ROTATE/05_commit.js",
        "TOOLS/ROTATE/interrupts/cancel.js",
        "TOOLS/SCALE/state.js",
        "TOOLS/SCALE/01_begin.js",
        "TOOLS/SCALE/02_capture.js",
        "TOOLS/SCALE/03_simulation.js",
        "TOOLS/SCALE/04_transform.js",
        "TOOLS/SCALE/05_commit.js",
        "TOOLS/SCALE/interrupts/cancel.js",
        "TOOLS/FLIP/flipHorizontal.js",
        "TOOLS/FLIP/flipVertical.js",
        "REFRESH/state.js",
        "REFRESH/01_boundingBox.js",
        "REFRESH/02_buttons.js",
        "REFRESH/03_overlay.js",
        "REFRESH/run.js",
        "TOOLS/factoryLine.js",
        "UTILS/coords.js",
        "UTILS/COORDS/boundsToScreenRect.js",
        "FACTORY/MANAGER/state.js",
        "FACTORY/MANAGER/create.js",
        "FACTORY/MANAGER/register.js",
        "FACTORY/MANAGER/guard.js",
        "FACTORY/MANAGER/advance.js",
        "FACTORY/MANAGER/run.js",
        "FACTORY/MANAGER/index.js",
        "FACTORY/01_system.js",
        "FACTORY/02_vm.js",
        "FACTORY/03_selection.js",
        "FACTORY/04_drawable.js",
        "FACTORY/05_bounds.js",
        "FACTORY/06_boundingBox.js",
        "FACTORY/07_buttons.js",
        "FACTORY/08_preview.js",
        "FACTORY/09_refresh.js",
        "FACTORY/10_done.js",
        "FACTORY/run.js",
        "INPUT/keyboard.js",
        "INPUT/shortcuts.js",
        "INPUT/SHORTCUTS/registerR.js",
        "UI/ELEMENTS/BOUNDINGBOX/STATE/create.js",
        "UI/ELEMENTS/BOUNDINGBOX/STATE/reset.js",
        "UI/ELEMENTS/BOUNDINGBOX/STATE/index.js",
        "UI/ELEMENTS/BOUNDINGBOX/DRAW/createNode.js",
        "UI/ELEMENTS/BOUNDINGBOX/DRAW/applyRect.js",
        "UI/ELEMENTS/BOUNDINGBOX/DRAW/index.js",
        "UI/ELEMENTS/BOUNDINGBOX/REFRESH/readTarget.js",
        "UI/ELEMENTS/BOUNDINGBOX/REFRESH/readDrawable.js",
        "UI/ELEMENTS/BOUNDINGBOX/REFRESH/readBounds.js",
        "UI/ELEMENTS/BOUNDINGBOX/REFRESH/convertBounds.js",
        "UI/ELEMENTS/BOUNDINGBOX/REFRESH/apply.js",
        "UI/ELEMENTS/BOUNDINGBOX/REFRESH/index.js",
        "UI/ELEMENTS/BOUNDINGBOX/PREVIEW/applyPosition.js",
        "UI/ELEMENTS/BOUNDINGBOX/PREVIEW/applyDelta.js",
        "UI/ELEMENTS/BOUNDINGBOX/PREVIEW/index.js",
        "UI/ELEMENTS/BOUNDINGBOX/VISIBILITY/show.js",
        "UI/ELEMENTS/BOUNDINGBOX/VISIBILITY/hide.js",
        "UI/ELEMENTS/BOUNDINGBOX/VISIBILITY/index.js",
        "UI/ELEMENTS/boundingBox.js",
        "UI/ELEMENTS/BOUNDINGBOX/draw.js",
        "UI/ELEMENTS/BOUNDINGBOX/update.js",
        "UI/ELEMENTS/BOUNDINGBOX/show.js",
        "UI/ELEMENTS/BOUNDINGBOX/hide.js",
        "UI/ELEMENTS/BOUNDINGBOX/refresh.js",
        "UI/ELEMENTS/buttons.js",
        "UI/ELEMENTS/BUTTONS/rotateButton.js",
        "UI/ELEMENTS/BUTTONS/ROTATEBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/ROTATEBUTTON/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/ROTATEBUTTON/mouseMove.js",
        "UI/ELEMENTS/BUTTONS/ROTATEBUTTON/mouseUp.js",
        "UI/ELEMENTS/BUTTONS/scaleButton.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/index.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/begin.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/capture.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/simulate.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/previewBox.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/previewButton.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/end.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/DRAG/run.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/EVENTS/index.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/EVENTS/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/mouseMove.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/mouseUp.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/create.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/reset.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/STATE/index.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/createNode.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/applyPosition.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/attachToBox.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAW/index.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/index.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/begin.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/capture.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/simulate.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/previewButton.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/previewBox.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/end.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/DRAG/run.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/EVENTS/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/EVENTS/mouseMove.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/EVENTS/mouseUp.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/EVENTS/index.js",
        "UI/ELEMENTS/BUTTONS/moveButton.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/mouseMove.js",
        "UI/ELEMENTS/BUTTONS/MOVEBUTTON/mouseUp.js",
        "UI/ELEMENTS/BUTTONS/flipHButton.js",
        "UI/ELEMENTS/BUTTONS/FLIPHBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/FLIPHBUTTON/click.js",
        "UI/ELEMENTS/BUTTONS/flipVButton.js",
        "UI/ELEMENTS/BUTTONS/FLIPVBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/FLIPVBUTTON/click.js",
        "UI/ELEMENTS/BUTTONS/resetTransformButton.js",
        "UI/ELEMENTS/BUTTONS/CLEARBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/CLEARBUTTON/click.js",
        "UI/ELEMENTS/BUTTONS/transparencyButton.js",
        "UI/ELEMENTS/BUTTONS/TRANSPARENCYBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/sizeWButton.js",
        "UI/ELEMENTS/BUTTONS/SIZEWBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/SIZEWBUTTON/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/SIZEWBUTTON/mouseMove.js",
        "UI/ELEMENTS/BUTTONS/SIZEWBUTTON/mouseUp.js",
        "UI/ELEMENTS/BUTTONS/sizeHButton.js",
        "UI/ELEMENTS/BUTTONS/SIZEHBUTTON/draw.js",
        "UI/ELEMENTS/BUTTONS/SIZEHBUTTON/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/SIZEHBUTTON/mouseMove.js",
        "UI/ELEMENTS/BUTTONS/SIZEHBUTTON/mouseUp.js",
        "UI/debugLayout.js",
        "UI/ui.js",
        "Transfork_Main.js"
    ];

    let loading = false;
    const loadedSources = [];

    window.TransforkNew = window.TransforkNew || {};
    window.TransforkNew.__pendingRegistryEntries = window.TransforkNew.__pendingRegistryEntries || [];
    window.TransforkNew.registerProcessMember = function registerProcessMember(meta) {
        const registry = window.TransforkNew?.SYSTEM?.REGISTRY;
        if (registry && typeof registry.register === "function") return registry.register(meta);
        if (meta && meta.id) window.TransforkNew.__pendingRegistryEntries.push(meta);
        return null;
    };
    window.TransforkNew.VERSION = VERSION;
    window.TransforkNew.registerProcessMember({ id: "MAIN.local.TransforkNew.Transfork.Loader.js.self", file: "TransforkNew/Transfork_Loader.js", functionName: "loader", purpose: "local process member registration for loader bootstrap", manager: "MAIN", station: 0 });
    window.TransforkNewLoader = { version: VERSION, modules: modules.slice(), hotReload };

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
    }

async function loadModule(name, token) {
        console.log("[TN LOADER] loading module", name);
        const modulesCache = window.TransforkModules || {};
        let text = null;
        const preferSource = name.startsWith("UI/ELEMENTS/BUTTONS/SCALEBUTTON/");

        async function fetchSource() {
            const response = await fetch(base + name + "?v=" + token, { cache: "no-store" });
            if (!response.ok) throw new Error("HTTP " + response.status + " loading " + name);
            return response.text();
        }

        if (preferSource) {
            try {
                text = await fetchSource();
            } catch (error) {
                text = modulesCache[name];
                if (typeof text !== "string") throw error;
            }
        } else {
            text = modulesCache[name];
            if (typeof text !== "string") {
                text = await fetchSource();
            }
        }

        if (typeof text !== "string") {
            const error = new Error("Missing module: " + name);
            console.error("[TN LOADER] module blocked line", name, {
                message: error.message,
                errorName: error.name
            });
            throw error;
        }

        try {
            console.log("[TN LOADER] executing", name, { bytes: text.length });
            Function(text + "\n//# sourceURL=TransforkNew/" + name + "?v=" + token)();

            const loadedRecord = { name, text, registered: false };
            loadedSources.push(loadedRecord);
            window.TransforkNew?.SYSTEM?.REGISTRY?.markLoaded?.(name);

            const registerModuleFunctions = window.TransforkNew?.SYSTEM?.REGISTRY?.registerModuleFunctions;
            if (typeof registerModuleFunctions === "function") {
                for (const record of loadedSources) {
                    if (record.registered) continue;
                    registerModuleFunctions(record.name, record.text);
                    record.registered = true;
                }
            }

            console.log("[TN LOADER] loaded", name);
            return { status: "done", name };
        } catch (error) {
            console.error("[TN LOADER] module blocked line", name, {
                message: error?.message || String(error),
                errorName: error?.name || "Error"
            });
            throw error;
        }
    }

    async function loadAll(reason) {
        if (loading) return;
        loading = true;
        try {
            if (window.__TransforkNewLoader && reason !== "hot-reload") return;
            window.__TransforkNewLoader = true;
            const token = cacheToken();
            console.log("[TN LOADER] loadAll begin", { reason, token, moduleCount: modules.length });
            for (const name of modules) {
                await loadModule(name, token);
            }
            window.TransforkNew?.INPUT?.keyboard?.init?.();
            window.TransforkNew?.INPUT?.shortcuts?.init?.();
            window.KEY?.setEnabled?.(true);
            console.log("[TN LOADER] KEY enabled after full module load", {
                registryCount: window.KEY?.registry?.length || window.KEY?.shortcuts?.length || 0,
                inputKeyboard: window.TransforkNew?.INPUT?.keyboard,
                inputShortcuts: window.TransforkNew?.INPUT?.shortcuts
            });
            window.TransforkNew?.SYSTEM?.REGISTRY?.rollcall?.();
            console.log("TransforkNew loader active " + VERSION + " (" + reason + ").");
            showToast("TransforkNew " + VERSION + " loaded");
        }
        finally {
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
