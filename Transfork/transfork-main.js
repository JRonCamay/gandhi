//test only
(function () {
        'use strict';

        if (window.__TransforkMainLoaded) return;
        window.__TransforkMainLoaded = true;

        let transformMode = false;
        const spriteAlphaMap =
        new Map();
        const runtimeGhostMap =
        new Map();

        let runtimePaused =
        false;
        let wasRunning =
        false;
        const originalSpriteDraggableMap =
        new Map();

        function setNativeSpriteDraggingEnabled(enabled) {
            if (
                !window.vm ||
                !window.vm.runtime ||
                !window.vm.runtime.targets
            ) {
                return;
            }

            for (
                const target of
                window.vm.runtime.targets
            ) {
                if (
                    !target ||
                    target.isStage
                ) {
                    continue;
                }

                if (
                    !originalSpriteDraggableMap.has(
                        target.id
                    )
                ) {
                    originalSpriteDraggableMap.set(
                        target.id,
                        target.draggable
                    );
                }

                target.draggable =
                enabled
                ? originalSpriteDraggableMap.get(
                    target.id
                )
                : false;
            }
        }

        function toggleTransformMode() {
            transformMode = !transformMode;

            setNativeSpriteDraggingEnabled(
                !transformMode
            );
        }

        window.addEventListener(
            "keydown",
            e => {
                if (e.repeat) return;

                const tag = e.target?.tagName;
                if (
                    tag === "INPUT" ||
                    tag === "TEXTAREA" ||
                    e.target?.isContentEditable
                ) {
                    return;
                }

                if (e.key.toLowerCase() === "r") {
                    e.preventDefault();
                    toggleTransformMode();
                }
            },
            true
        );

        function waitForVM() {
            const interval = setInterval(() => {
                    const sprite = document.querySelector('[class*="sprite-selector"]');
                    if (!sprite) return;

                    const fiberKey = Object.keys(sprite).find(
                        k => k.startsWith("__reactFiber$")
                    );
                    if (!fiberKey) return;

                    let node = sprite[fiberKey];
                    while (node) {
                        const props = node.memoizedProps;
                        if (props && props.vm) {
                            window.vm = props.vm;
                            clearInterval(interval);

                            init();
                            return;
                        }
                        node = node.return;
                    }
                }, 1000);
        }

        function isStageMaximized() {

            const fullscreenButton =
            document.querySelector(
                '[class*="stage-size-toggle-group"]'
            );

            if (!fullscreenButton)
            return false;

            return (
                document.body.innerText
                .includes("Small Stage")
            );
        }

        function restoreEditorAlphas() {

            for (
                const target of
                vm.runtime.targets
            ) {

                const alpha =
                spriteAlphaMap.get(
                    target.id
                );

                if (
                    alpha === undefined
                ) continue;

                target.setEffect(
                    "ghost",
                    100 - alpha
                );
            }
        }
        function captureRuntimeGhosts() {

            runtimeGhostMap.clear();

            for (
                const target of
                vm.runtime.targets
            ) {

                runtimeGhostMap.set(
                    target.id,
                    target.effects.ghost || 0
                );
            }
        }

        function restoreRuntimeGhosts() {

            for (
                const target of
                vm.runtime.targets
            ) {

                const ghost =
                runtimeGhostMap.get(
                    target.id
                );

                if (
                    ghost === undefined
                ) continue;

                target.setEffect(
                    "ghost",
                    ghost
                );
            }
        }
        // Helper to safely manipulate sprite graphic transparency via the Scratch VM engine
        function applySpriteAlpha(value) {
            if (!window.vm || !window.vm.editingTarget) return;
            const target = window.vm.editingTarget;

            // Map alpha (0-100 opacity) to Scratch ghost effect (100 = invisible, 0 = fully opaque)
            const ghostValue = 100 - value;
            target.setEffect('ghost', ghostValue);
        }

        // Helper to retrieve current sprite alpha status
        function getSpriteAlpha() {
            if (!window.vm || !window.vm.editingTarget) return 100;
            const ghost = window.vm.editingTarget.effects.ghost || 0;
            return 100 - ghost;
        }

        const AssetBakeEngine = (() => {
                function getCurrentCostume(target) {
                    if (
                        !target ||
                        !target.sprite ||
                        !target.sprite.costumes
                    ) {
                        return null;
                    }

                    return target.sprite.costumes[
                        target.currentCostume
                    ];
                }

                function getCostumeSource(costume) {
                    if (
                        !costume ||
                        !costume.asset
                    ) {
                        return null;
                    }

                    if (
                        typeof costume.asset.encodeDataURI === "function"
                    ) {
                        return costume.asset.encodeDataURI();
                    }

                    return null;
                }

                function getCanvasWidth(image, costume) {
                    return (
                        image.naturalWidth ||
                        image.width ||
                        (
                            costume &&
                            costume.size &&
                            costume.size[0]
                        ) ||
                        1
                    );
                }

                function getCanvasHeight(image, costume) {
                    return (
                        image.naturalHeight ||
                        image.height ||
                        (
                            costume &&
                            costume.size &&
                            costume.size[1]
                        ) ||
                        1
                    );
                }

                function exportCanvas(
                    canvas,
                    callback
                ) {
                    canvas.toBlob(
                        blob => {
                            if (!blob) return;

                            const reader =
                            new FileReader();

                            reader.onload =
                            () => {
                                callback(
                                    new Uint8Array(
                                        reader.result
                                    )
                                );
                            };

                            reader.readAsArrayBuffer(
                                blob
                            );
                        },
                        "image/png"
                    );
                }

                function createCostumeAsset(data) {
                    const storage =
                    vm.runtime.storage;

                    if (
                        !storage ||
                        typeof storage.createAsset !== "function"
                    ) {
                        return null;
                    }

                    const assetType =
                    (
                        storage.AssetType &&
                        storage.AssetType.ImageBitmap
                    ) ||
                    "ImageBitmap";

                    const dataFormat =
                    (
                        storage.DataFormat &&
                        storage.DataFormat.PNG
                    ) ||
                    "png";

                    return storage.createAsset(
                        assetType,
                        dataFormat,
                        data,
                        null,
                        true
                    );
                }

                function replaceCurrentCostume(
                    target,
                    costume,
                    asset,
                    canvas
                ) {
                    if (
                        !target ||
                        !target.sprite ||
                        !target.sprite.costumes ||
                        !asset
                    ) {
                        return;
                    }

                    const index =
                    target.currentCostume;

                    const skinId =
                    costume.skinId;

                    const replacement =
                    Object.assign(
                        {},
                        costume
                    );

                    replacement.asset =
                    asset;

                    replacement.assetId =
                    asset.assetId;

                    replacement.dataFormat =
                    "png";

                    replacement.md5ext =
                    asset.assetId + ".png";

                    replacement.skinId =
                    skinId;

                    if (
                        canvas &&
                        canvas.width &&
                        canvas.height
                    ) {
                        replacement.size = [
                            canvas.width,
                            canvas.height
                        ];
                    }

                    if (
                        canvas &&
                        typeof canvas.__gandhiBakeRotationCenterX === "number" &&
                        typeof canvas.__gandhiBakeRotationCenterY === "number"
                    ) {
                        replacement.rotationCenterX =
                        canvas.__gandhiBakeRotationCenterX;

                        replacement.rotationCenterY =
                        canvas.__gandhiBakeRotationCenterY;
                    }

                    target.sprite.costumes[
                        index
                    ] = replacement;

                    vm.runtime.renderer.updateBitmapSkin(
                        skinId,
                        canvas,
                        replacement.bitmapResolution || 1,
                        [
                            replacement.rotationCenterX,
                            replacement.rotationCenterY
                        ]
                    );

                    target.setCostume(
                        index
                    );

                    if (
                        typeof target.updateAllDrawableProperties === "function"
                    ) {
                        target.updateAllDrawableProperties();
                    }

                    target.emitVisualChange();
                    vm.runtime.requestRedraw();
                }

                function bakeCurrentCostume(
                    callback,
                    targetOverride
                ) {
                    const target =
                    targetOverride ||
                    vm.editingTarget;

                    const costume =
                    getCurrentCostume(
                        target
                    );

                    const source =
                    getCostumeSource(
                        costume
                    );

                    if (!source) return;

                    const image =
                    new Image();

                    image.onload =
                    () => {
                        const canvas =
                        document.createElement("canvas");

                        canvas.width =
                        getCanvasWidth(
                            image,
                            costume
                        );

                        canvas.height =
                        getCanvasHeight(
                            image,
                            costume
                        );

                        const ctx =
                        canvas.getContext("2d");

                        ctx.drawImage(
                            image,
                            0,
                            0
                        );

                        let afterBake =
                        null;

                        if (
                            typeof callback === "function"
                        ) {
                            afterBake =
                            callback(
                                canvas,
                                ctx,
                                image,
                                costume,
                                target
                            );
                        }

                        exportCanvas(
                            canvas,
                            data => {
                                const asset =
                                createCostumeAsset(
                                    data
                                );

                                if (
                                    canvas &&
                                    typeof canvas.__gandhiBeforeReplace === "function"
                                ) {
                                    canvas.__gandhiBeforeReplace();
                                }

                                replaceCurrentCostume(
                                    target,
                                    costume,
                                    asset,
                                    canvas
                                );

                                if (
                                    typeof afterBake === "function"
                                ) {
                                    afterBake();
                                }

                            }
                        );
                    };

                    image.src =
                    source;
                }

                return {
                    bakeCurrentCostume
                };
        })();

        window.AssetBakeEngine =
        AssetBakeEngine;

        function init() {
            const canvas = getStageCanvas();

            canvas.addEventListener(
                "mousedown",
                e => {

                    if (activeSkewSession) return;

                    if (!transformMode)
                    return;

                    const rect =
                    canvas.getBoundingClientRect();

                    const drawableID =
                    vm.runtime.renderer.pick(
                        e.clientX - rect.left,
                        e.clientY - rect.top
                    );

                    if (
                        drawableID >= 0
                    ) {
                        e.preventDefault();
                        e.stopPropagation();

                        const dragTarget =
                        vm.runtime.targets.find(
                            t =>
                            t.drawableID ===
                            drawableID
                        );

                        Transfork.tools.moveTool.begin(
                            e,
                            {
                                target: dragTarget,
                                canvas,
                                source: "stage-drag"
                            }
                        );
                    }

                },
                true
            );
            canvas.addEventListener(
                "click",
                e => {
                    if (!transformMode) return;

                    const rect = canvas.getBoundingClientRect();

                    const drawableID = vm.runtime.renderer.pick(
                        e.clientX - rect.left,
                        e.clientY - rect.top
                    );

                    const target = vm.runtime.targets.find(
                        t => t.drawableID === drawableID
                    );

                    if (target) {
                        vm.setEditingTarget(target.id);
                    }
                }
            );

            const overlay = document.createElement("div");
            overlay.id = "gandi-transform-box";

            Object.assign(
                overlay.style,
                {
                    position: "fixed",
                    border: "2px solid #00A2FF",
                    pointerEvents: "none",
                    zIndex: "9999",
                    boxSizing: "border-box",
                    display: "none",
                    userSelect: "none",
                    cursor: "move"
                }
            );

            document.body.appendChild(overlay);
            const tooltip =
            document.createElement(
                "div"
            );

            Object.assign(
                tooltip.style,
                {
                    position: "fixed",

                    background:  "rgba(20,20,20,.92)",

                    color: "white",
                    fontWeight:
                    "500",
                    padding: "2px 6px",

                    borderRadius: "3px",

                    fontSize: "10px",

                    pointerEvents: "none",

                    zIndex: "10001",

                    display: "none",

                    whiteSpace: "nowrap",

                    boxShadow:
                    "0 2px 8px rgba(0,0,0,.4)"
                }
            );

            document.body.appendChild(
                tooltip
            );
            function showTooltip(
                text,
                e
            ) {

                tooltip.textContent =
                text;

                tooltip.style.display =
                "block";

                moveTooltip(e);
            }

            function hideTooltip() {

                tooltip.style.display =
                "none";
            }
            function attachTooltip(
                element,
                name
            ) {

                element.addEventListener(
                    "mouseenter",
                    e =>
                    showTooltip(
                        name,
                        e
                    )
                );

                element.addEventListener(
                    "mouseleave",
                    hideTooltip
                );

                element.addEventListener(
                    "mousemove",
                    moveTooltip
                );

                element.addEventListener(
                    "mousedown",
                    hideTooltip
                );

                element.addEventListener(
                    "click",
                    hideTooltip
                );
            }
            function moveTooltip(
                e
            ) {

                const offset = 8;

                let x =
                e.clientX +
                offset;

                let y =
                e.clientY +
                offset;

                const rect =
                tooltip.getBoundingClientRect();

                if (
                    x + rect.width >
                    window.innerWidth
                ) {

                    x =
                    e.clientX -
                    rect.width -
                    offset;
                }

                if (
                    y + rect.height >
                    window.innerHeight
                ) {

                    y =
                    e.clientY -
                    rect.height -
                    offset;
                }

                tooltip.style.left =
                x + "px";

                tooltip.style.top =
                y + "px";
            }

            const resizeHandle = document.createElement("div");
            Object.assign(
                resizeHandle.style,
                {
                    position: "absolute",
                    width: "12px",
                    height: "12px",
                    background: "#00A2FF",
                    right: "-6px",
                    bottom: "-6px",
                    cursor: "nwse-resize",
                    border: "1px solid white",
                    boxSizing: "border-box",
                    pointerEvents: "auto"
                }
            );
            overlay.appendChild(resizeHandle);

            const moveHandle = document.createElement("div");
            Object.assign(
                moveHandle.style,
                {
                    position: "absolute",
                    left: "50%",
                    top: "-23px",
                    width: "20px",
                    height: "20px",
                    marginLeft: "-12px",
                    background: "#e53935",
                    color: "white",
                    fontSize: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "move",
                    borderRadius: "4px",
                    border: "1px solid white",
                    pointerEvents: "auto"
                }
            );
            moveHandle.innerHTML = "✥";
            overlay.appendChild(moveHandle);

            const flipVerticalHandle = document.createElement("div");
            Object.assign(
                flipVerticalHandle.style,
                {
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    left: "-26px",
                    top: "24px",
                    background: "#16a085",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    cursor: "pointer",
                    pointerEvents: "auto"
                }
            );
            flipVerticalHandle.innerHTML = "⇅";
            overlay.appendChild(flipVerticalHandle);

            const rotateHandle = document.createElement("div");
            rotateHandle.innerHTML = "↻";
            Object.assign(
                rotateHandle.style,
                {
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    background: "#ff9800",
                    borderRadius: "50%",
                    left: "50%",
                    top: "-44px",
                    marginLeft: "-12px",
                    cursor: "grab",
                    pointerEvents: "auto",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "bold",
                }
            );
            overlay.appendChild(rotateHandle);

            // --- NEW SPARK: ALPHA CONTROLLER INPUT OVER THE ROTATE BUTTON ---
            const alphaContainer = document.createElement("div");
            alphaContainer.id = "transform-alpha-container";
            Object.assign(
                alphaContainer.style,
                {
                    position: "absolute",
                    left: "50%",
                    top: "-70px",
                    width: "36px",
                    marginLeft: "-20px",
                    background: "#34495e",
                    border: "1px solid #5d7a94",
                    borderRadius: "4px",
                    padding: "2px 2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "auto",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.3)"
                }
            );

            alphaContainer.innerHTML = `
            <span
            id="transform-alpha-icon"
            style="
            color:white;
            font-size:11px;
            margin-right:3px;
            user-select:none;
            transition:opacity 0.1s linear;
            "
            >
            ◐
            </span>

            <input
            id="transform-alpha-num"
            type="text"
            value="100"
            style="
            background:transparent;
            color:white;
            border:none;
            width:22px;
            text-align:center;
            font-size:10px;
            font-weight:bold;
            outline:none;
            cursor:ew-resize;
            "
            >
            `;
            overlay.appendChild(alphaContainer);

            const alphaInput = alphaContainer.querySelector("#transform-alpha-num");
            const alphaIcon =
            alphaContainer.querySelector(
                "#transform-alpha-icon"
            );
            function updateAlphaIcon(opacity) {

                alphaIcon.style.opacity =
                Math.max(
                    0.15,
                    opacity / 100
                );
            }
            alphaInput.addEventListener(
                "click",
                e => {

                    e.stopPropagation();

                    alphaInput.focus();

                    alphaInput.select();
                }
            );
            const resizeButton = document.createElement("div");
            const skewHandle =
            document.createElement("div");

            Object.assign(
                skewHandle.style,
                {
                    position: "absolute",

                    width: "20px",
                    height: "20px",

                    right: "-27px",
                    bottom: "66px",

                    background: "#00A2FF",

                    color: "white",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    cursor: "pointer",

                    borderRadius: "4px",

                    border: "1px solid white",

                    pointerEvents: "auto"
                }
            );

            skewHandle.innerHTML =
            "🛠";

            overlay.appendChild(
                skewHandle
            );
            const assetToolsPanel =
            document.createElement("div");

            Object.assign(
                assetToolsPanel.style,
                {
                    position: "absolute",
                    left: "calc(100% + 35px)",
                    top: "calc(100% - 86px)",
                    width: "150px",
                    background: "#2c3e50",
                    border: "1px solid #5d7a94",
                    borderRadius: "4px",
                    padding: "4px",
                    display: "none",
                    flexDirection: "column",
                    gap: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.35)",
                    pointerEvents: "auto",
                    zIndex: "10000"
                }
            );

            function createAssetToolButton(
                label,
                disabled
            ) {
                const button =
                document.createElement("button");

                button.type =
                "button";

                if (
                    label.includes("Skew")
                ) {
                    button.textContent =
                    "↗ Skew";
                }
                else if (
                    label.includes("Perspective")
                ) {
                    button.textContent =
                    "◰ Perspective (Disabled)";
                }
                else if (
                    label.includes("Wave")
                ) {
                    button.textContent =
                    "〰 Wave (Disabled)";
                }
                else if (
                    label.includes("Twirl")
                ) {
                    button.textContent =
                    "🌀 Twirl (Disabled)";
                }
                else if (
                    label.includes("Bulge")
                ) {
                    button.textContent =
                    "⬤ Bulge (Disabled)";
                }
                else {
                    button.textContent =
                    label;
                }

                Object.assign(
                    button.style,
                    {
                        width: "100%",
                        background: disabled ? "#3f5364" : "#00A2FF",
                        color: "white",
                        border: "1px solid #5d7a94",
                        borderRadius: "4px",
                        padding: "4px 6px",
                        fontSize: "11px",
                        textAlign: "left",
                        cursor: disabled ? "not-allowed" : "pointer",
                        opacity: disabled ? "0.55" : "1",
                        pointerEvents: "auto"
                    }
                );

                button.disabled =
                disabled;

                return button;
            }

            const assetSkewButton =
            createAssetToolButton(
                "↗ Skew (Coming Soon)",
                false
            );

            assetToolsPanel.appendChild(
                assetSkewButton
            );

            assetToolsPanel.appendChild(
                createAssetToolButton(
                    "◰ Perspective (Disabled)",
                    true
                )
            );

            assetToolsPanel.appendChild(
                createAssetToolButton(
                    "〰 Wave (Disabled)",
                    true
                )
            );

            assetToolsPanel.appendChild(
                createAssetToolButton(
                    "🌀 Twirl (Disabled)",
                    true
                )
            );

            assetToolsPanel.appendChild(
                createAssetToolButton(
                    "⬤ Bulge (Disabled)",
                    true
                )
            );

            overlay.appendChild(
                assetToolsPanel
            );
            const widthHandle =
            document.createElement("div");

            Object.assign(
                widthHandle.style,
                {
                    position: "absolute",

                    width: "20px",
                    height: "20px",

                    right: "-27px",
                    bottom: "42px",

                    background: "#00A2FF",

                    color: "white",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    cursor: "ew-resize",

                    borderRadius: "4px",

                    border: "1px solid white",

                    pointerEvents: "auto"
                }
            );

            widthHandle.innerHTML =
            "↔";

            overlay.appendChild(
                widthHandle
            );
            const heightHandle =
            document.createElement("div");

            Object.assign(
                heightHandle.style,
                {
                    position: "absolute",

                    width: "20px",
                    height: "20px",

                    right: "-27px",
                    bottom: "18px",

                    background: "#00A2FF",

                    color: "white",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    cursor: "ns-resize",

                    borderRadius: "4px",

                    border: "1px solid white",

                    pointerEvents: "auto"
                }
            );

            heightHandle.innerHTML =
            "↕";

            overlay.appendChild(
                heightHandle
            );
            Object.assign(
                resizeButton.style,
                {
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    right: "-27px",
                    bottom: "-6px",
                    background: "#00A2FF",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "nwse-resize",
                    borderRadius: "4px",
                    border: "1px solid white",
                    pointerEvents: "auto"
                }
            );
            resizeButton.innerHTML = "◲";
            overlay.appendChild(resizeButton);

            const flipHandle = document.createElement("div");
            Object.assign(
                flipHandle.style,
                {
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    left: "-26px",
                    top: "0px",
                    background: "#8e44ad",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    cursor: "pointer",
                    pointerEvents: "auto"
                }
            );
            flipHandle.innerHTML = "⇋";
            overlay.appendChild(flipHandle);

            const resetHandle = document.createElement("div");
            Object.assign(
                resetHandle.style,
                {
                    position: "absolute",
                    width: "20px",
                    height: "20px",
                    left: "-26px",
                    top: "48px",
                    background: "#c0392b",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "4px",
                    cursor: "pointer",
                    pointerEvents: "auto"
                }
            );
            resetHandle.innerHTML = "⟲";
            overlay.appendChild(resetHandle);

            resetHandle.addEventListener(
                "click",
                () => {
                    const target = vm.editingTarget;
                    const drawable =
                    vm.runtime.renderer
                    ._allDrawables[
                        target.drawableID
                    ];

                    if (drawable) {

                        installShearHook(
                            drawable,
                            target
                        );

                    }

                    target.setDirection(90);
                    target.setSize(100);
                    applySpriteAlpha(100);
                    alphaInput.value = 100;
                    target.updateAllDrawableProperties();
                    target.emitVisualChange();
                }
            );
            const nameContainer =
            document.createElement(
                "div"
            );

            Object.assign(
                nameContainer.style,
                {
                    position: "absolute",

                    left: "-1px",
                    top: "100%",

                    transform:
                    "translateY(6px)",

                    display: "flex",
                    alignItems: "center",
                    gap: "4px",

                    pointerEvents: "auto"
                }
            );

            overlay.appendChild(
                nameContainer
            );
            const renameButton =
            document.createElement(
                "div"
            );

            Object.assign(
                renameButton.style,
                {
                    width: "20px",
                    height: "20px",

                    background: "#f39c12",

                    color: "white",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    borderRadius: "4px",

                    cursor: "pointer",

                    fontSize: "12px"
                }
            );

            renameButton.innerHTML =
            "✎";

            nameContainer.appendChild(
                renameButton
            );
            renameButton.addEventListener(
                "click",
                () => {

                    nameInput.focus();

                    nameInput.select();
                }
            );
            const nameInput =
            document.createElement(
                "input"
            );

            Object.assign(
                nameInput.style,
                {
                    minWidth: "60px",
                    maxWidth: "250px",

                    background: "#34495e",

                    color: "white",

                    border: "1px solid #5d7a94",

                    borderRadius: "4px",

                    fontSize: "10px",

                    padding: "2px 6px",

                    outline: "none"
                }
            );

            nameContainer.appendChild(
                nameInput
            );
            function updateNameInputWidth() {

                const chars =
                Math.max(
                    8,
                    nameInput.value.length
                );

                nameInput.style.width =
                (chars * 7) + "px";
            }
            nameInput.addEventListener(
                "input",
                updateNameInputWidth
            );
            nameInput.addEventListener(
                "keydown",
                e => {

                    if (
                        e.key === "Enter"
                    ) {

                        const newName =
                        nameInput.value.trim();

                        if (
                            !newName
                        ) return;

                        const target =
                        vm.editingTarget;
                        vm.renameSprite(
                            target.id,
                            newName
                        );

                        nameInput.blur();
                    }
                }
            );
            attachTooltip(
                moveHandle,
                "Move"
            );

            attachTooltip(
                rotateHandle,
                "Rotate"
            );

            attachTooltip(
                resizeButton,
                "Resize"
            );

            attachTooltip(
                resizeHandle,
                "Resize"
            );

            attachTooltip(
                flipHandle,
                "Flip Horizontal"
            );

            attachTooltip(
                flipVerticalHandle,
                "Flip Vertical"
            );

            attachTooltip(
                resetHandle,
                "Reset"
            );

            attachTooltip(
                alphaContainer,
                "Opacity"
            );
            attachTooltip(
                skewHandle,
                "Asset Tools"
            );
            attachTooltip(
                widthHandle,
                "Width Scale"
            );

            attachTooltip(
                heightHandle,
                "Height Scale"
            );
            function closeAssetToolsPanel() {
                assetToolsPanel.style.display =
                "none";
            }

            function toggleAssetToolsPanel() {
                assetToolsPanel.style.display =
                assetToolsPanel.style.display === "none"
                ? "flex"
                : "none";
            }

            skewHandle.addEventListener(
                "mousedown",
                e => {
                    e.preventDefault();
                    e.stopPropagation();
                }
            );

            skewHandle.addEventListener(
                "click",
                e => {
                    e.preventDefault();
                    e.stopPropagation();

                    toggleAssetToolsPanel();
                }
            );

            assetToolsPanel.addEventListener(
                "mousedown",
                e => {
                    e.stopPropagation();
                }
            );

            assetSkewButton.addEventListener(
                "mousedown",
                e => {
                    e.preventDefault();
                    e.stopPropagation();

                    closeAssetToolsPanel();
                    createSkewSession(e);
                }
            );

            document.addEventListener(
                "mousedown",
                e => {
                    if (
                        assetToolsPanel.style.display === "none"
                    ) {
                        return;
                    }

                    if (
                        overlay.contains(e.target)
                    ) {
                        return;
                    }

                    closeAssetToolsPanel();
                },
                true
            );
            widthHandle.addEventListener(
                "mousedown",
                e => {

                    e.preventDefault();
                    e.stopPropagation();
                    Transfork.tools.resizeTool.begin(
                        e,
                        {
                            target: vm.editingTarget,
                            mode: "width",
                            vm,
                            getDrawable: target =>
                                vm.runtime.renderer
                                ._allDrawables[
                                    target.drawableID
                                ],
                            installShearHook,
                            getVisualFlipX: () => visualFlipX
                        }
                    );
                }
            );
            heightHandle.addEventListener(
                "mousedown",
                e => {

                    e.preventDefault();
                    e.stopPropagation();
                    Transfork.tools.resizeTool.begin(
                        e,
                        {
                            target: vm.editingTarget,
                            mode: "height",
                            vm,
                            getDrawable: target =>
                                vm.runtime.renderer
                                ._allDrawables[
                                    target.drawableID
                                ],
                            installShearHook,
                            getVisualFlipX: () => visualFlipX
                        }
                    );
                }
            );
            let startMouseX = 0;
            let startMouseY = 0;
            let shearX = 0;
            let shearY = 0;
            let activeSkewSession = null;
            let activeShearBridge = null;
            let alphaDragging = false;
            let lastPosX = null;
            let lastPosY = null;
            let alphaDragStartX = 0;

            let alphaStartValue = 100;
            let visualFlipX = false;
            let transformTarget = null;
            const snapLock = {
                x: null,
                y: null
            };

            // --- CLICK & HOLD SLIDER INTEGRATION FOR INSTANT REVEAL ---

            alphaInput.addEventListener(
                "mousedown",
                e => {

                    alphaDragging = true;

                    alphaDragStartX =
                    e.clientX;

                    alphaStartValue =
                    parseInt(
                        alphaInput.value,
                        10
                    );

                    e.preventDefault();
                }
            );

            alphaInput.addEventListener("change", () => {
                    let val = parseInt(alphaInput.value, 10);
                    if (isNaN(val)) return;
                    if (val > 100) alphaInput.value = 100;
                    if (val < 0) alphaInput.value = 0;
                    updateAlphaIcon(
                        Number(alphaInput.value)
                    );
                    applySpriteAlpha(alphaInput.value);
                    spriteAlphaMap.set(
                        vm.editingTarget.id,
                        Number(alphaInput.value)
                    );
            });
            alphaInput.addEventListener(
                "keydown",
                e => {

                    if (
                        e.key === "Enter"
                    ) {

                        alphaInput.blur();
                    }
                }
            );
            resizeHandle.addEventListener(
                "mousedown",
                e => {
                    e.preventDefault();
                    e.stopPropagation();
                    Transfork.tools.resizeTool.begin(
                        e,
                        {
                            target: vm.editingTarget,
                            mode: "uniform",
                            vm,
                            getDrawable: target =>
                                vm.runtime.renderer
                                ._allDrawables[
                                    target.drawableID
                                ],
                            installShearHook,
                            getVisualFlipX: () => visualFlipX
                        }
                    );
                }
            );

            resizeButton.addEventListener(
                "mousedown",
                e => {
                    e.preventDefault();
                    e.stopPropagation();
                    Transfork.tools.resizeTool.begin(
                        e,
                        {
                            target: vm.editingTarget,
                            mode: "uniform",
                            vm,
                            getDrawable: target =>
                                vm.runtime.renderer
                                ._allDrawables[
                                    target.drawableID
                                ],
                            installShearHook,
                            getVisualFlipX: () => visualFlipX
                        }
                    );
                }
            );

            function normalizeDirection(deg) {
                while (deg > 180) deg -= 360;
                while (deg <= -180) deg += 360;
                return deg;
            }

            function installShearHook(drawable, target) {

                if (!drawable) return;

                if (drawable.__gandhiShearInstalled)
                return;

                drawable.__gandhiShearInstalled =
                true;

                if (target) {
                    drawable.__gandhiTargetId =
                    target.id;
                }

                const oldGetUniforms =
                drawable.getUniforms.bind(drawable);

                drawable.getUniforms =
                function () {

                    const uniforms =
                    oldGetUniforms();

                    const original =
                    uniforms.u_modelMatrix;

                    const m =
                    new Float32Array(
                        original
                    );

                    let shearX = 0;
                    let shearY = 0;

                    if (
                        activeShearBridge &&
                        activeShearBridge.drawable === this
                    ) {
                        shearX = activeShearBridge.shearX || 0;
                        shearY = activeShearBridge.shearY || 0;
                    }

                    const a = m[0];
                    const b = m[1];
                    const c = m[4];
                    const d = m[5];

                    m[0] =
                    a + c * shearY;

                    m[1] =
                    b + d * shearY;

                    m[4] =
                    c + a * shearX;

                    m[5] =
                    d + b * shearX;

                    uniforms.u_modelMatrix = m;

                    return uniforms;

                };

            }

            function createSkewSession(e) {
                if (activeSkewSession) {
                    activeSkewSession.destroy();
                    activeSkewSession = null;
                }

                const target = vm.editingTarget;
                if (!target) return null;

                const drawable =
                vm.runtime.renderer._allDrawables[
                    target.drawableID
                ];
                if (!drawable) return null;

                installShearHook(
                    drawable,
                    target
                );

                activeShearBridge = {
                    drawable,
                    shearX: 0,
                    shearY: 0
                };

                const session = {
                    target,
                    drawable,
                    startMouseX: e.clientX,
                    startMouseY: e.clientY,
                    startShearX: 0,
                    startShearY: 0,

                    onMove(moveEvent) {
                        activeShearBridge.shearX =
                        this.startShearX +
                        (moveEvent.clientX - this.startMouseX) / 200;

                        activeShearBridge.shearY =
                        this.startShearY +
                        (moveEvent.clientY - this.startMouseY) / 200;

                        this.drawable.setTransformDirty();
                        this.target.emitVisualChange();
                        vm.runtime.requestRedraw();

                        this.target.setXY(
                            this.target.x,
                            this.target.y
                        );

                        this.target.emitVisualChange();
                        vm.runtime.requestRedraw();
                    },

                    onUp(upEvent) {
                        const finalShearX =
                        this.startShearX +
                        (upEvent.clientX - this.startMouseX) / 200;

                        const finalShearY =
                        this.startShearY +
                        (upEvent.clientY - this.startMouseY) / 200;

                        if (activeShearBridge) {
                            activeShearBridge.shearX = finalShearX;
                            activeShearBridge.shearY = finalShearY;
                        }

                        window.removeEventListener("mousemove", this.boundMove, true);
                        window.removeEventListener("mouseup", this.boundUp, true);

                        activeSkewSession = null;

                        AssetBakeEngine.bakeCurrentCostume(
                            (
                                canvas,
                                ctx,
                                image,
                                costume
                            ) => {
                                bakeSkewToCanvas(
                                    canvas,
                                    costume,
                                    -finalShearX,
                                    -finalShearY
                                );

                                canvas.__gandhiBeforeReplace =
                                () => {
                                    activeShearBridge = null;
                                };

                                return updateSelectionBox;
                            },
                            this.target
                        );
                    },

                    destroy() {
                        if (
                            activeShearBridge &&
                            activeShearBridge.drawable === this.drawable
                        ) {
                            activeShearBridge = null;
                        }

                        window.removeEventListener("mousemove", this.boundMove, true);
                        window.removeEventListener("mouseup", this.boundUp, true);
                    }
                };

                session.boundMove =
                session.onMove.bind(session);

                session.boundUp =
                session.onUp.bind(session);

                window.addEventListener("mousemove", session.boundMove, true);
                window.addEventListener("mouseup", session.boundUp, true);

                activeSkewSession = session;

                return session;
            }

            function bakeSkewToCanvas(
                canvas,
                costume,
                shearX,
                shearY
            ) {
                if (
                    !shearX &&
                    !shearY
                ) {
                    return;
                }

                const width =
                canvas.width;

                const height =
                canvas.height;

                const source =
                document.createElement("canvas");

                source.width =
                width;

                source.height =
                height;

                const sourceCtx =
                source.getContext("2d");

                sourceCtx.drawImage(
                    canvas,
                    0,
                    0
                );

                const cx =
                width / 2;

                const cy =
                height / 2;

                const points = [
                    [0, 0],
                    [width, 0],
                    [width, height],
                    [0, height]
                ].map(
                    point => {
                        const x =
                        point[0];

                        const y =
                        point[1];

                        return {
                            x:
                            x +
                            (
                                y -
                                cy
                            ) *
                            shearX,

                            y:
                            y +
                            (
                                x -
                                cx
                            ) *
                            shearY
                        };
                    }
                );

                const minX =
                Math.floor(
                    Math.min(
                        ...points.map(point => point.x)
                    )
                );

                const minY =
                Math.floor(
                    Math.min(
                        ...points.map(point => point.y)
                    )
                );

                const maxX =
                Math.ceil(
                    Math.max(
                        ...points.map(point => point.x)
                    )
                );

                const maxY =
                Math.ceil(
                    Math.max(
                        ...points.map(point => point.y)
                    )
                );

                canvas.width =
                Math.max(
                    1,
                    maxX - minX
                );

                canvas.height =
                Math.max(
                    1,
                    maxY - minY
                );

                const ctx =
                canvas.getContext("2d");

                ctx.clearRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                ctx.setTransform(
                    1,
                    shearY,
                    shearX,
                    1,
                    -shearX * cy - minX,
                    -shearY * cx - minY
                );

                ctx.drawImage(
                    source,
                    0,
                    0
                );

                ctx.setTransform(
                    1,
                    0,
                    0,
                    1,
                    0,
                    0
                );

                const rotationCenterX =
                typeof costume.rotationCenterX === "number"
                ? costume.rotationCenterX
                : cx;

                const rotationCenterY =
                typeof costume.rotationCenterY === "number"
                ? costume.rotationCenterY
                : cy;

                canvas.__gandhiBakeRotationCenterX =
                rotationCenterX -
                minX;

                canvas.__gandhiBakeRotationCenterY =
                rotationCenterY -
                minY;
            }

            function applyTargetVisualFlipX(target) {
                if (!target) return;

                const drawable =
                vm.runtime.renderer._allDrawables[
                    target.drawableID
                ];
                installShearHook(
                    drawable,
                    target
                );
                if (!drawable) return;

                const absX =
                Math.abs(
                    drawable.scale[0]
                );

                drawable.updateScale([
                        target.__gandhiVisualFlipX ? -absX : absX,
                        drawable.scale[1]
                ]);
            }

            function toggleTargetVisualFlipX(target) {
                target.__gandhiVisualFlipX =
                !target.__gandhiVisualFlipX;

                applyTargetVisualFlipX(
                    target
                );
            }

            flipHandle.addEventListener(
                "click",
                () => {
                    const target = vm.editingTarget;
                    if (!target) return;

                    const oldDirection =
                    target.direction;

                    target.setDirection(
                        normalizeDirection(
                            180 - oldDirection
                        )
                    );

                    toggleTargetVisualFlipX(
                        target
                    );

                    target.emitVisualChange();
                    vm.runtime.requestRedraw();

                    updateSelectionBox();
                }
            );

            flipVerticalHandle.addEventListener(
                "click",
                () => {
                    const target = vm.editingTarget;
                    if (!target) return;

                    const oldDirection =
                    target.direction;

                    target.setDirection(
                        normalizeDirection(
                            -oldDirection
                        )
                    );

                    toggleTargetVisualFlipX(
                        target
                    );

                    target.emitVisualChange();
                    vm.runtime.requestRedraw();

                    updateSelectionBox();
                }
            );

            rotateHandle.addEventListener(
                "mousedown",
                e => {
                    e.preventDefault();
                    e.stopPropagation();
                    Transfork.tools.rotateTool.begin(
                        e,
                        {
                            target: vm.editingTarget,
                            renderer: vm.runtime.renderer,
                            overlay,
                            getDrawable: target =>
                                vm.runtime.renderer
                                ._allDrawables[
                                    target.drawableID
                                ],
                            installShearHook
                        }
                    );
                }
            );

            moveHandle.addEventListener(
                "mousedown",
                e => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (activeSkewSession) return;
                    Transfork.tools.moveTool.begin(
                        e,
                        {
                            target: vm.editingTarget,
                            canvas,
                            source: "move-handle"
                        }
                    );
                }
            );

            window.addEventListener(
                "mouseup",
                () => {

                    Transfork.tools.moveTool.commit();

                    Transfork.tools.resizeTool.commit();

                    Transfork.tools.rotateTool.commit();
                    transformTarget = null;

                    alphaDragging =
                    false;

                    snapLock.x =
                    null;

                    snapLock.y =
                    null;

                    window.Transfork.snapVisuals.clear();
                }
            );

            window.addEventListener(
                "mousemove",
                e => {

                    if (activeSkewSession) {
                        return;
                    }

                    Transfork.tools.moveTool.update(
                        e,
                        {
                            findSnapPosition
                        }
                    );

                    if (
                        Transfork.tools.moveTool.isActive() ||
                        Transfork.tools.resizeTool.isActive() ||
                        Transfork.tools.rotateTool.isActive() ||
                        alphaDragging
                    ) {

                        hideTooltip();
                    }
                    if (alphaDragging) {

                        const delta =
                        Math.floor(
                            (
                                e.clientX -
                                alphaDragStartX
                            ) / 2
                        );

                        let value =
                        alphaStartValue +
                        delta;

                        value =
                        Math.max(
                            0,
                            Math.min(
                                100,
                                value
                            )
                        );

                        alphaInput.value =
                        value;
                        alphaIcon.style.opacity =
                        Math.max(
                            0.15,
                            value / 100
                        );
                        applySpriteAlpha(
                            value
                        );
                        spriteAlphaMap.set(
                            vm.editingTarget.id,
                            value
                        );
                        vm.editingTarget
                        .emitVisualChange();
                    }
                    Transfork.tools.resizeTool.update(
                        e,
                        {
                            getDrawable: target =>
                                vm.runtime.renderer
                                ._allDrawables[
                                    target.drawableID
                                ],
                            getVisualFlipX: () => visualFlipX
                        }
                    );

                    Transfork.tools.rotateTool.update(
                        e,
                        {
                            getDrawable: target =>
                                vm.runtime.renderer
                                ._allDrawables[
                                    target.drawableID
                                ]
                        }
                    );

                }
            );

            function getStageCanvas() {
                const canvases = document.querySelectorAll("canvas");
                return canvases[0] || null;
            }

            function scratchToScreen(x, y, canvas) {
                const [width, height] = vm.runtime.renderer.getNativeSize();
                const rect = canvas.getBoundingClientRect();

                return {
                    x: rect.left + ((x + width / 2) / width) * rect.width,
                    y: rect.top + ((height / 2 - y) / height) * rect.height
                };
            }

            function getStageUnitsPerScreenPixel() {
                const canvas =
                getStageCanvas();

                if (!canvas) {
                    return 1;
                }

                const rect =
                canvas.getBoundingClientRect();

                const nativeSize =
                vm.runtime.renderer.getNativeSize();

                const stageWidth =
                nativeSize[0];

                if (!rect.width) {
                    return 1;
                }

                return rect.width / stageWidth;
            }

            function offsetBounds(bounds, dx, dy) {
                return {
                    left: bounds.left + dx,
                    right: bounds.right + dx,
                    top: bounds.top + dy,
                    bottom: bounds.bottom + dy
                };
            }

            function getSnapEdgeDelta(
                otherBounds,
                bounds,
                sourceEdge,
                targetEdge
            ) {
                return otherBounds[sourceEdge] -
                bounds[targetEdge];
            }

            function getLockedSnap(
                lock,
                bounds,
                renderer,
                snapDistance,
                releaseDistance
            ) {
                if (
                    !lock ||
                    !lock.target ||
                    lock.target.visible === false
                ) {
                    return null;
                }

                const otherDrawable =
                renderer._allDrawables[
                    lock.target.drawableID
                ];

                if (
                    !otherDrawable ||
                    otherDrawable._visible === false
                ) {
                    return null;
                }

                const otherBounds =
                otherDrawable.getAABB();

                const delta =
                getSnapEdgeDelta(
                    otherBounds,
                    bounds,
                    lock.sourceEdge,
                    lock.targetEdge
                );

                if (
                    Math.abs(delta) >
                    snapDistance + releaseDistance
                ) {
                    return null;
                }

                return {
                    delta,
                    bounds: otherBounds,
                    target: lock.target,
                    sourceEdge: lock.sourceEdge,
                    targetEdge: lock.targetEdge
                };
            }

            function findSnapPosition(target, desiredX, desiredY) {
                const renderer =
                vm.runtime.renderer;

                const drawable =
                renderer._allDrawables[
                    target.drawableID
                ];

                if (!drawable) {
                    return {
                        x: desiredX,
                        y: desiredY
                    };
                }

                const currentBounds =
                drawable.getAABB();

                const bounds =
                offsetBounds(
                    currentBounds,
                    desiredX - target.x,
                    desiredY - target.y
                );

                /* snapScale removed: delta is already in stage units */

                const canvas =
                getStageCanvas();

                const rect =
                canvas.getBoundingClientRect();

                const nativeSize =
                vm.runtime.renderer.getNativeSize();

                const snapDistance =
                12 *
                (
                    nativeSize[0] /
                    rect.width
                );

                let snapX =
                null;
                let snapXTarget =
                null;
                let snapXOtherTarget =
                null;
                let snapXSourceEdge =
                null;
                let snapXTargetEdge =
                null;
                let snapY =
                null;
                let snapYTarget =
                null;
                let snapYOtherTarget =
                null;
                let snapYSourceEdge =
                null;
                let snapYTargetEdge =
                null;
                const snapCandidates = {
                    left: null,
                    right: null,
                    top: null,
                    bottom: null
                };
                const candidateDeltas = {
                    left: null,
                    right: null,
                    top: null,
                    bottom: null
                };
                Transfork.snap.findCandidates(
                    {
                        target,
                        renderer,
                        runtime: vm.runtime,
                        bounds
                    }
                ).forEach(
                    candidateTarget => {
                        const otherTarget =
                        candidateTarget.target;

                        const otherBounds =
                        candidateTarget.bounds;

                        [
                            {
                                side: "left",
                                sourceEdge: "left",
                                targetEdge: "left",
                                delta: otherBounds.left - bounds.left
                            },
                            {
                                side: "left",
                                sourceEdge: "right",
                                targetEdge: "left",
                                delta: otherBounds.right - bounds.left
                            },
                            {
                                side: "right",
                                sourceEdge: "left",
                                targetEdge: "right",
                                delta: otherBounds.left - bounds.right
                            },
                            {
                                side: "right",
                                sourceEdge: "right",
                                targetEdge: "right",
                                delta: otherBounds.right - bounds.right
                            }
                        ].forEach(
                            candidate => {
                                const delta =
                                candidate.delta;

                                if (
                                    Math.abs(delta) <= snapDistance &&
                                    (
                                        candidateDeltas[candidate.side] === null ||
                                        Math.abs(delta) <
                                        Math.abs(candidateDeltas[candidate.side])
                                    )
                                ) {
                                    candidateDeltas[candidate.side] =
                                    delta;

                                    snapCandidates[candidate.side] =
                                    otherBounds;
                                }

                                if (
                                    Math.abs(delta) <= snapDistance &&
                                    (
                                        snapX === null ||
                                        Math.abs(delta) < Math.abs(snapX)
                                    )
                                ) {
                                    snapX =
                                    delta;

                                    snapXTarget =
                                    otherBounds;

                                    snapXOtherTarget =
                                    otherTarget;

                                    snapXSourceEdge =
                                    candidate.sourceEdge;

                                    snapXTargetEdge =
                                    candidate.targetEdge;
                                }
                            }
                        );

                        [
                            {
                                side: "top",
                                sourceEdge: "top",
                                targetEdge: "top",
                                delta: otherBounds.top - bounds.top
                            },
                            {
                                side: "top",
                                sourceEdge: "bottom",
                                targetEdge: "top",
                                delta: otherBounds.bottom - bounds.top
                            },
                            {
                                side: "bottom",
                                sourceEdge: "top",
                                targetEdge: "bottom",
                                delta: otherBounds.top - bounds.bottom
                            },
                            {
                                side: "bottom",
                                sourceEdge: "bottom",
                                targetEdge: "bottom",
                                delta: otherBounds.bottom - bounds.bottom
                            }
                        ].forEach(
                            candidate => {
                                const delta =
                                candidate.delta;

                                if (
                                    Math.abs(delta) <= snapDistance &&
                                    (
                                        candidateDeltas[candidate.side] === null ||
                                        Math.abs(delta) <
                                        Math.abs(candidateDeltas[candidate.side])
                                    )
                                ) {
                                    candidateDeltas[candidate.side] =
                                    delta;

                                    snapCandidates[candidate.side] =
                                    otherBounds;
                                }

                                if (
                                    Math.abs(delta) <= snapDistance &&
                                    (
                                        snapY === null ||
                                        Math.abs(delta) < Math.abs(snapY)
                                    )
                                ) {
                                    snapY =
                                    delta;

                                    snapYTarget =
                                    otherBounds;

                                    snapYOtherTarget =
                                    otherTarget;

                                    snapYSourceEdge =
                                    candidate.sourceEdge;

                                    snapYTargetEdge =
                                    candidate.targetEdge;
                                }
                            }
                        );
                    }
                );
                if (
                    snapX !== null &&
                    snapY === null &&
                    snapXTarget
                ) {

                    const topDelta =
                    snapXTarget.top -
                    bounds.top;

                    const bottomDelta =
                    snapXTarget.bottom -
                    bounds.bottom;

                    if (
                        Math.abs(topDelta) <=
                        snapDistance
                    ) {

                        snapY =
                        topDelta;

                        snapYTarget =
                        snapXTarget;

                        snapYOtherTarget =
                        snapXOtherTarget;

                        snapYSourceEdge =
                        "top";

                        snapYTargetEdge =
                        "top";

                    }
                    else if (
                        Math.abs(bottomDelta) <=
                        snapDistance
                    ) {

                        snapY =
                        bottomDelta;

                        snapYTarget =
                        snapXTarget;

                        snapYOtherTarget =
                        snapXOtherTarget;

                        snapYSourceEdge =
                        "bottom";

                        snapYTargetEdge =
                        "bottom";

                    }

                }

                if (
                    snapY !== null &&
                    snapX === null &&
                    snapYTarget
                ) {

                    const leftDelta =
                    snapYTarget.left -
                    bounds.left;

                    const rightDelta =
                    snapYTarget.right -
                    bounds.right;

                    if (
                        Math.abs(leftDelta) <=
                        snapDistance
                    ) {

                        snapX =
                        leftDelta;

                        snapXTarget =
                        snapYTarget;

                        snapXOtherTarget =
                        snapYOtherTarget;

                        snapXSourceEdge =
                        "left";

                        snapXTargetEdge =
                        "left";

                    }
                    else if (
                        Math.abs(rightDelta) <=
                        snapDistance
                    ) {

                        snapX =
                        rightDelta;

                        snapXTarget =
                        snapYTarget;

                        snapXOtherTarget =
                        snapYOtherTarget;

                        snapXSourceEdge =
                        "right";

                        snapXTargetEdge =
                        "right";

                    }

                }
                const releaseDistance =
                6;

                const lockedX =
                getLockedSnap(
                    snapLock.x,
                    bounds,
                    renderer,
                    snapDistance,
                    releaseDistance
                );

                if (lockedX) {
                    snapX =
                    lockedX.delta;

                    snapXTarget =
                    lockedX.bounds;
                }
                else if (
                    snapX !== null &&
                    snapXOtherTarget
                ) {
                    snapLock.x =
                    {
                        target: snapXOtherTarget,
                        sourceEdge: snapXSourceEdge,
                        targetEdge: snapXTargetEdge,
                        delta: snapX,
                        value:
                        desiredX +
                        snapX
                    };
                }
                else {
                    snapLock.x =
                    null;
                }

                const lockedY =
                getLockedSnap(
                    snapLock.y,
                    bounds,
                    renderer,
                    snapDistance,
                    releaseDistance
                );

                if (lockedY) {
                    snapY =
                    lockedY.delta;

                    snapYTarget =
                    lockedY.bounds;
                }
                else if (
                    snapY !== null &&
                    snapYOtherTarget
                ) {
                    snapLock.y =
                    {
                        target: snapYOtherTarget,
                        sourceEdge: snapYSourceEdge,
                        targetEdge: snapYTargetEdge,
                        delta: snapY,
                        value:
                        desiredY +
                        snapY
                    };
                }
                else {
                    snapLock.y =
                    null;
                }

                const snapResult = {
                    x:
                    snapLock.x
                    ? snapLock.x.value
                    : desiredX +
                      (
                          snapX === null
                          ? 0
                          : snapX
                      ),

                    y:
                    snapLock.y
                    ? snapLock.y.value
                    : desiredY +
                      (
                          snapY === null
                          ? 0
                          : snapY
                      )
                };

                window.Transfork.snapVisuals.update(
                    {
                        target,
                        candidates: snapCandidates,
                        result: snapResult
                    }
                );

                return snapResult;
            }

            function getShearAdjustedBounds(
                bounds,
                drawable
            ) {
                let shearX = 0;
                let shearY = 0;

                if (
                    activeShearBridge &&
                    activeShearBridge.drawable === drawable
                ) {
                    shearX = activeShearBridge.shearX || 0;
                    shearY = activeShearBridge.shearY || 0;
                }

                if (
                    !shearX &&
                    !shearY
                ) {
                    return bounds;
                }

                const cx =
                (
                    bounds.left +
                    bounds.right
                ) / 2;

                const cy =
                (
                    bounds.top +
                    bounds.bottom
                ) / 2;

                const points = [
                    [bounds.left, bounds.top],
                    [bounds.right, bounds.top],
                    [bounds.right, bounds.bottom],
                    [bounds.left, bounds.bottom]
                ].map(
                    p => {
                        const x =
                        p[0] - cx;

                        const y =
                        p[1] - cy;

                        return {
                            x:
                            cx +
                            x +
                            y * shearX,

                            y:
                            cy +
                            y +
                            x * shearY
                        };
                    }
                );

                return {
                    left:
                    Math.min(
                        ...points.map(p => p.x)
                    ),

                    right:
                    Math.max(
                        ...points.map(p => p.x)
                    ),

                    top:
                    Math.max(
                        ...points.map(p => p.y)
                    ),

                    bottom:
                    Math.min(
                        ...points.map(p => p.y)
                    )
                };
            }

            function updateSelectionBox() {
                const canvas = getStageCanvas();
                if (!canvas) return;

                const target = vm.editingTarget;
                if (!target) return;

                const drawable = vm.runtime.renderer._allDrawables[target.drawableID];
                installShearHook(
                    drawable,
                    target
                );
                if (!drawable) return;

                applyTargetVisualFlipX(
                    target
                );

                const rawBounds =
                drawable.getAABB();

                const bounds =
                getShearAdjustedBounds(
                    rawBounds,
                    drawable
                );
                const tl = scratchToScreen(bounds.left, bounds.top, canvas);
                const br = scratchToScreen(bounds.right, bounds.bottom, canvas);

                overlay.style.left =
                tl.x + "px";

                overlay.style.top =
                tl.y + "px";
                overlay.style.width = (br.x - tl.x) + "px";
                overlay.style.height = (br.y - tl.y) + "px";
                if (document.activeElement !== alphaInput) {
                    const alpha =
                    getSpriteAlpha();

                    alphaInput.value =
                    alpha;

                    updateAlphaIcon(
                        alpha
                    );
                }
                if (
                    document.activeElement !==
                    nameInput
                ) {

                    nameInput.value =
                    target.sprite.name;

                    updateNameInputWidth();
                }
            }

            function isStageVisible() {
                const canvas = getStageCanvas();
                if (!canvas) return false;

                const rect = canvas.getBoundingClientRect();
                return (
                    rect.width > 50 &&
                    rect.height > 50 &&
                    rect.top < window.innerHeight &&
                    rect.left < window.innerWidth
                );
            }

            function isCodeTabOpen() {
                const selectedTab = document.querySelector('[class*="selected"]');
                if (!selectedTab) return false;

                return selectedTab.textContent
                .trim()
                .includes("Code");
            }

            function isStageOnTop() {
                const canvas = getStageCanvas();
                if (!canvas) return false;

                const rect = canvas.getBoundingClientRect();
                const el = document.elementFromPoint(
                    rect.left + rect.width / 2,
                    rect.top + rect.height / 2
                );

                if (
                    el &&
                    (
                        el.id === "gandi-transform-box" ||
                        el.closest("#gandi-transform-box")
                    )
                ) {
                    return true;
                }
                return (
                    el === canvas ||
                    canvas.contains(el)
                );
            }

            function animate() {

                const target =
                vm.editingTarget;
                const running =
                vm.runtime.threads.some(
                    t => !t.isKilled
                );

                if (
                    wasRunning &&
                    !running
                ) {

                    restoreEditorAlphas();
                }

                wasRunning =
                running;
                if (
                    transformMode &&
                    isStageOnTop() &&
                    isCodeTabOpen()
                ) {
                    overlay.style.display = "block";
                    updateSelectionBox();
                } else {
                    overlay.style.display = "none";
                }
                requestAnimationFrame(animate);
            }

            const originalGreenFlag =
            vm.greenFlag.bind(vm);

            vm.greenFlag =
            function () {

                restoreEditorAlphas();

                originalGreenFlag();
            };
            const pauseButton =
            document.querySelector(
                '[class*="gandi_controls_pause"]'
            );

            const stopButton =
            document.querySelector(
                '[class*="gandi_stop-all_stop-all"]'
            );

            if (pauseButton) {

                pauseButton.addEventListener(
                    "click",
                    () => {

                        if (!runtimePaused) {

                            captureRuntimeGhosts();

                            restoreEditorAlphas();

                            runtimePaused =
                            true;

                        } else {

                            restoreRuntimeGhosts();

                            runtimePaused =
                            false;

                        }
                    }
                );
            }

            if (stopButton) {

                stopButton.addEventListener(
                    "click",
                    () => {

                        setTimeout(
                            restoreEditorAlphas,
                            50
                        );
                    }
                );
            }
            animate();

        }

        waitForVM();

})();
