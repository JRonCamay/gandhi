// ==UserScript==
// @name         Gandhi TransforkNew Loader
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Loads TransforkNew clean architecture modules
// @match        *://www.cocrea.world/*
// @grant        none
// ==/UserScript==

(function () {
    "use strict";

    const base = "https://raw.githubusercontent.com/JRonCamay/gandhi/main/TransforkNew/";
    const cache = "260706-r-test";
    const modules = [
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
        "UI/ui.js",
        "Transfork_Main.js"
    ];

    async function loadModule(name) {
        const response = await fetch(base + name + "?v=" + cache, { cache: "no-store" });
        if (!response.ok) throw new Error("Failed to fetch " + name + ": " + response.status);
        Function(await response.text())();
    }

    async function loadAll() {
        if (window.__TransforkNewLoader) return;
        window.__TransforkNewLoader = true;
        for (const name of modules) await loadModule(name);
        console.log("TransforkNew loader active 0.3 R test.");
    }

    loadAll().catch(error => console.error("TransforkNew loader failed", error));
})();
