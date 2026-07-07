window.TransforkNew = window.TransforkNew || {};
window.TransforkNew.UI = window.TransforkNew.UI || {};

(function () {
    "use strict";

    function set(id, styles) {
        const node = document.getElementById(id);
        if (!node) return;

        Object.assign(node.style, styles);
    }

    function apply() {
        const small = {
            width: "15px",
            height: "15px",
            minWidth: "15px",
            minHeight: "15px",
            fontSize: "10px",
            borderRadius: "3px",
            lineHeight: "15px"
        };

        set("transfork-new-move-button", Object.assign({}, small, { top: "-18px", marginLeft: "-7.5px" }));
        set("transfork-new-rotate-button", Object.assign({}, small, { top: "-38px", marginLeft: "-7.5px" }));
        set("transfork-new-flip-h-button", Object.assign({}, small, { left: "-19px", top: "0px" }));
        set("transfork-new-flip-v-button", Object.assign({}, small, { left: "-19px", top: "18px" }));
        set("transfork-new-reset-transform-button", Object.assign({}, small, { left: "-19px", top: "36px" }));
        set("transfork-new-size-w-button", Object.assign({}, small, { right: "-19px", bottom: "36px" }));
        set("transfork-new-size-h-button", Object.assign({}, small, { right: "-19px", bottom: "18px" }));
        set("transfork-new-scale-button", Object.assign({}, small, { right: "-19px", bottom: "0px" }));
        set("transfork-new-transparency-button", { top: "-56px", transform: "scale(0.75)", transformOrigin: "center" });
        set("transfork-new-version-label", {
            top: "-76px",
            background: "rgba(18,26,38,0.98)",
            color: "white",
            border: "1px solid #00A2FF",
            borderRadius: "5px",
            padding: "3px 7px",
            textShadow: "0 1px 2px rgba(0,0,0,0.85)",
            boxShadow: "0 2px 8px rgba(0,0,0,0.35)"
        });
    }

    function start() {
        apply();
        requestAnimationFrame(apply);
        setTimeout(apply, 100);
    }

    window.TransforkNew.UI.debugLayout = {
        apply,
        start
    };

    start();
})();
