// TransforkV3 UI system
(function () {
    "use strict";

    const app = window.TransforkV3 = window.TransforkV3 || {};
    const runtime = app.runtime = app.runtime || {};

    const ROOT_ID = "tf3-ui-root";
    const BOX_ID = "tf3-transform-box";

    const api = {
        name: "UI",
        started: false,
        root: null,
        box: null,
        handles: {}
    };

    function createElement(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text) element.textContent = text;
        return element;
    }

    function applyStyles() {
        if (document.getElementById("tf3-ui-style")) return;

        const style = document.createElement("style");
        style.id = "tf3-ui-style";
        style.textContent = `
#${ROOT_ID} {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483000;
}
#${BOX_ID} {
    position: fixed;
    display: none;
    left: 160px;
    top: 160px;
    width: 160px;
    height: 120px;
    border: 2px solid #2f80ff;
    box-sizing: border-box;
    pointer-events: none;
}
#${BOX_ID}.tf3-visible {
    display: block;
}
.tf3-handle {
    position: absolute;
    width: 14px;
    height: 14px;
    border-radius: 3px;
    background: #2f80ff;
    border: 2px solid white;
    box-sizing: border-box;
    pointer-events: auto;
}
.tf3-handle-scale {
    right: -9px;
    bottom: -9px;
    cursor: nwse-resize;
}
.tf3-handle-move {
    left: 50%;
    top: -28px;
    transform: translateX(-50%);
    width: auto;
    min-width: 42px;
    height: 22px;
    padding: 2px 8px;
    font: 12px Arial, sans-serif;
    line-height: 16px;
    color: white;
    text-align: center;
    cursor: move;
}
`;
        document.head.appendChild(style);
    }

    api.createToolbox = function () {
        applyStyles();

        let root = document.getElementById(ROOT_ID);
        if (!root) {
            root = createElement("div", "tf3-ui-root");
            root.id = ROOT_ID;
            document.body.appendChild(root);
        }

        let box = document.getElementById(BOX_ID);
        if (!box) {
            box = createElement("div", "tf3-transform-box");
            box.id = BOX_ID;

            const move = createElement("div", "tf3-handle tf3-handle-move", "MOVE");
            const scale = createElement("div", "tf3-handle tf3-handle-scale");
            move.dataset.tf3Handle = "move";
            scale.dataset.tf3Handle = "scale";

            box.appendChild(move);
            box.appendChild(scale);
            root.appendChild(box);

            api.handles.move = move;
            api.handles.scale = scale;
        }

        api.root = root;
        api.box = box;
        runtime.uiRoot = root;
        runtime.transformBoxElement = box;

        return box;
    };

    api.show = function () {
        const box = api.createToolbox();
        box.classList.add("tf3-visible");
        runtime.toolboxVisible = true;
    };

    api.hide = function () {
        const box = api.createToolbox();
        box.classList.remove("tf3-visible");
        runtime.toolboxVisible = false;
    };

    api.toggle = function () {
        if (runtime.toolboxVisible) api.hide();
        else api.show();
    };

    api.destroy = function () {
        if (api.root && api.root.parentNode) api.root.parentNode.removeChild(api.root);
        api.root = null;
        api.box = null;
        api.handles = {};
        runtime.uiRoot = null;
        runtime.transformBoxElement = null;
        runtime.toolboxVisible = false;
    };

    api.start = function () {
        if (api.started) return;
        api.started = true;
        api.createToolbox();
    };

    if (typeof app.registerSystem === "function") app.registerSystem("UI", api);
})();
