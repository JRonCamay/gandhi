// TransforkV3 RENDER system
(function () {
    "use strict";

    const app = window.TransforkV3 = window.TransforkV3 || {};

    function findVM() {
        if (window.vm && window.vm.runtime && window.vm.runtime.renderer) return window.vm;
        if (window.Scratch && window.Scratch.vm && window.Scratch.vm.runtime && window.Scratch.vm.runtime.renderer) return window.Scratch.vm;

        const sprite = document.querySelector('[class*="sprite-selector"]');
        if (!sprite) return null;

        const fiberKey = Object.keys(sprite).find(function (key) {
            return key.indexOf("__reactFiber$") === 0;
        });
        if (!fiberKey) return null;

        let node = sprite[fiberKey];
        while (node) {
            const props = node.memoizedProps;
            if (props && props.vm && props.vm.runtime && props.vm.runtime.renderer) {
                window.vm = props.vm;
                return props.vm;
            }
            node = node.return;
        }
        return null;
    }

    function refresh() {
        const runtime = app.runtime = app.runtime || {};
        const ui = app.systems && app.systems.UI;
        const debug = {
            hasUI: !!ui,
            hasCreateToolbox: !!(ui && typeof ui.createToolbox === "function"),
            hasSetBounds: !!(ui && typeof ui.setBounds === "function")
        };

        let box = null;
        if (ui && typeof ui.createToolbox === "function") {
            box = ui.createToolbox();
        } else {
            box = document.querySelector("#tf3-transform-box");
        }

        debug.hasBox = !!box;
        if (!ui || !box) {
            runtime.renderDebug = debug;
            return box || null;
        }

        const vm = findVM();
        const renderer = vm && vm.runtime && vm.runtime.renderer;
        const target = vm && vm.editingTarget;
        const canvas = renderer && renderer.canvas;

        debug.hasVM = !!vm;
        debug.hasRenderer = !!renderer;
        debug.hasTarget = !!target;
        debug.targetIsStage = !!(target && target.isStage);
        debug.hasCanvas = !!canvas;
        debug.drawableID = target && target.drawableID;

        if (!vm || !renderer || !target || target.isStage || !canvas) {
            runtime.renderDebug = debug;
            return box;
        }

        const drawable = renderer._allDrawables && renderer._allDrawables[target.drawableID];
        debug.hasDrawable = !!drawable;
        if (!drawable || typeof drawable.getAABB !== "function") {
            runtime.renderDebug = debug;
            return box;
        }

        const bounds = drawable.getAABB();
        debug.bounds = bounds;
        if (!bounds) {
            runtime.renderDebug = debug;
            return box;
        }

        const native = typeof renderer.getNativeSize === "function" ? renderer.getNativeSize() : [480, 360];
        const canvasRect = canvas.getBoundingClientRect();
        const topLeft = {
            x: canvasRect.left + ((bounds.left + native[0] / 2) / native[0]) * canvasRect.width,
            y: canvasRect.top + ((native[1] / 2 - bounds.top) / native[1]) * canvasRect.height
        };
        const bottomRight = {
            x: canvasRect.left + ((bounds.right + native[0] / 2) / native[0]) * canvasRect.width,
            y: canvasRect.top + ((native[1] / 2 - bounds.bottom) / native[1]) * canvasRect.height
        };
        const rect = {
            left: topLeft.x,
            top: topLeft.y,
            width: bottomRight.x - topLeft.x,
            height: bottomRight.y - topLeft.y
        };

        debug.native = native;
        debug.canvasRect = {
            left: canvasRect.left,
            top: canvasRect.top,
            width: canvasRect.width,
            height: canvasRect.height
        };
        debug.screenRect = rect;

        if (typeof ui.setBounds === "function") ui.setBounds(rect);
        runtime.vm = vm;
        runtime.renderer = renderer;
        runtime.target = target;
        runtime.stageCanvas = canvas;
        runtime.lastRenderBounds = rect;
        runtime.renderDebug = debug;
        return box;
    }

    const api = {
        name: "RENDER",
        started: false,
        start: function () {
            api.started = true;
            refresh();
        },
        refresh
    };

    if (typeof app.registerSystem === "function") app.registerSystem("RENDER", api);
})();