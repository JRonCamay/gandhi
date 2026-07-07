// ==UserScript==
// @name         Gandhi TransforkNew Loader
// @namespace    http://tampermonkey.net/
// @version      1.2.3-dev
// @description  Loads TransforkNew clean architecture modules
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const VERSION = ["1", "2", "3-dev"].join(".");
    const base = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/TransforkNew/";
    const modules = [
        "SYSTEM/MAR.js",
        "SYSTEM/version.js",
        "SYSTEM/VM/find.js",
        "SYSTEM/VM/getSelectedTarget.js",
        "SYSTEM/VM/getDrawable.js",
        "SYSTEM/VM/getCanvas.js",
        "SYSTEM/vm.js",
        "UTILS/coords.js",
        "UTILS/COORDS/boundsToScreenRect.js",
        "INPUT/keyboard.js",
        "INPUT/shortcuts.js",
        "INPUT/SHORTCUTS/registerR.js",
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
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/mouseDown.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/mouseMove.js",
        "UI/ELEMENTS/BUTTONS/SCALEBUTTON/mouseUp.js",
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
    let pendingR = false;
    let rDown = false;

    window.TransforkNew = window.TransforkNew || {};
    window.TransforkNew.VERSION = VERSION;
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
        window.__TransforkNewLoader = false;
        window.TransforkNew = { VERSION };
    }

    function triggerR() {
        const toggle = window.TransforkNew?.INPUT?.SHORTCUTS?.toggleR;
        if (typeof toggle === "function") {
            toggle();
            return true;
        }
        pendingR = true;
        return false;
    }

    function consumePendingR() {
        if (!pendingR) return;
        pendingR = false;
        triggerR();
    }

    function captureShortcut(event) {
        const key = event.key?.toLowerCase?.();
        if (key !== "r") return;

        if (event.type === "keyup") {
            rDown = false;
            return;
        }

        if (event.ctrlKey && event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            hotReload().catch(error => console.error("TransforkNew hot reload failed", error));
            return;
        }

        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (rDown) return;
        rDown = true;

        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        triggerR();
    }

    function registerEarlyShortcuts() {
        if (window.__TransforkNewEarlyShortcuts) return;
        window.__TransforkNewEarlyShortcuts = true;
        [window, document].forEach(target => {
            target.addEventListener("keydown", captureShortcut, true);
            target.addEventListener("keyup", captureShortcut, true);
        });
    }

    async function loadModule(name, token) {
        const response = await fetch(base + name + "?v=" + token, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch " + name + ": " + response.status);
        Function(await response.text() + "\n//# sourceURL=" + base + name + "?v=" + token)();
    }

    async function loadAll(reason) {
        if (loading) return;
        loading = true;
        try {
            if (window.__TransforkNewLoader && reason !== "hot-reload") return;
            window.__TransforkNewLoader = true;
            const token = cacheToken();
            for (const name of modules) await loadModule(name, token);
            consumePendingR();
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

    registerEarlyShortcuts();
    loadAll("startup").catch(error => console.error("TransforkNew loader failed", error));
})();
