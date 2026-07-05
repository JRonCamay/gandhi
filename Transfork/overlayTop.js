window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;
    const TOP_Z = "2147483647";

    function ensureStyle260705_OT8K2P() {
        if (document.getElementById("transfork-overlay-top-style")) return;

        const style = document.createElement("style");
        style.id = "transfork-overlay-top-style";
        style.textContent = `
            #gandi-transform-box {
                z-index: ${TOP_Z} !important;
            }
            #gandi-transform-box * {
                z-index: ${TOP_Z} !important;
            }
        `;
        document.head.appendChild(style);
    }

    function bringBoxToTop260705_BT5M7N() {
        ensureStyle260705_OT8K2P();

        const box = api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box");
        if (!box) return;

        box.style.zIndex = TOP_Z;
        box.style.pointerEvents = box.style.pointerEvents || "none";

        Array.from(box.children || []).forEach(child => {
            child.style.zIndex = TOP_Z;
        });
    }

    function patchSelectionBox260705_PS9C4H() {
        if (!api.selectionBox || api.selectionBox.__transforkTopPatched) return;

        const originalPlace = api.selectionBox.place;
        const originalMoveFromStart = api.selectionBox.moveFromStart;

        if (typeof originalPlace === "function") {
            api.selectionBox.place = function (...args) {
                const result = originalPlace.apply(this, args);
                bringBoxToTop260705_BT5M7N();
                return result;
            };
        }

        if (typeof originalMoveFromStart === "function") {
            api.selectionBox.moveFromStart = function (...args) {
                const result = originalMoveFromStart.apply(this, args);
                bringBoxToTop260705_BT5M7N();
                return result;
            };
        }

        api.selectionBox.__transforkTopPatched = true;
    }

    function start260705_ST3Q8D() {
        ensureStyle260705_OT8K2P();
        patchSelectionBox260705_PS9C4H();
        bringBoxToTop260705_BT5M7N();
    }

    start260705_ST3Q8D();

    const observer = new MutationObserver(start260705_ST3Q8D);
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });

    api.registerModule260705_NS8Q2M("overlayTop", {
        bringBoxToTop: bringBoxToTop260705_BT5M7N,
        patchSelectionBox: patchSelectionBox260705_PS9C4H
    });
})();
