window.Transfork = window.Transfork || {};

(function () {
        "use strict";

        const api = window.Transfork;

        function getCostume260705_LY7D2Q(target) {
            return target?.sprite?.costumes?.[target.currentCostume] || null;
        }

        function getSource260705_LY8M4W(costume) {
            if (!costume?.asset) return "";
            if (typeof costume.asset.encodeDataURI === "function") return costume.asset.encodeDataURI();
            if (typeof costume.asset.decodeText === "function") return "data:image/svg+xml;base64," + btoa(costume.asset.decodeText());
            return "";
        }

        function screenRect260705_LY4C8N(bounds, canvas, vm) {
            if (api.coords?.boundsToScreenRect) return api.coords.boundsToScreenRect(bounds, canvas, vm);

            const native = vm.runtime.renderer.getNativeSize();
            const rect = canvas.getBoundingClientRect();
            const left = rect.left + ((bounds.left + native[0] / 2) / native[0]) * rect.width;
            const top = rect.top + ((native[1] / 2 - bounds.top) / native[1]) * rect.height;
            const right = rect.left + ((bounds.right + native[0] / 2) / native[0]) * rect.width;
            const bottom = rect.top + ((native[1] / 2 - bounds.bottom) / native[1]) * rect.height;
            return { left, top, width: right - left, height: bottom - top };
        }

        function stageScale260705_LY5S1X(canvas, vm) {
            const rect = canvas.getBoundingClientRect();
            const native = vm.runtime.renderer.getNativeSize();
            return native?.[0] ? rect.width / native[0] : 1;
        }

        function imageDataUsable260705_LY6U9F(imageData) {
            if (!imageData?.data?.length) return false;

            const data = imageData.data;
            let visible = 0;
            let different = 0;
            let firstR = null;
            let firstG = null;
            let firstB = null;

            for (let i = 0; i < data.length; i += 16) {
                if (!data[i + 3]) continue;
                visible++;

                if (firstR === null) {
                    firstR = data[i];
                    firstG = data[i + 1];
                    firstB = data[i + 2];
                }
                else if (
                    Math.abs(data[i] - firstR) > 4 ||
                    Math.abs(data[i + 1] - firstG) > 4 ||
                    Math.abs(data[i + 2] - firstB) > 4
                ) {
                    different++;
                }
            }

            return visible > 4 && (different > 0 || visible < data.length / 32);
        }

        function canvasFromImageData260705_LY3I8Q(imageData) {
            if (!imageDataUsable260705_LY6U9F(imageData)) return null;
            const canvas = document.createElement("canvas");
            canvas.width = imageData.width;
            canvas.height = imageData.height;
            canvas.getContext("2d").putImageData(imageData, 0, 0);
            return canvas;
        }

        function normalizeExtracted260705_LY2N7V(extracted) {
            if (!extracted) return null;

            if (typeof ImageData !== "undefined" && extracted instanceof ImageData) {
                return canvasFromImageData260705_LY3I8Q(extracted);
            }

            if (extracted instanceof HTMLCanvasElement) {
                if (!extracted.width || !extracted.height) return null;
                try {
                    const data = extracted.getContext("2d").getImageData(0, 0, extracted.width, extracted.height);
                    return imageDataUsable260705_LY6U9F(data) ? extracted : null;
                }
                catch (_error) {
                    return extracted;
                }
            }

            if (typeof ImageBitmap !== "undefined" && extracted instanceof ImageBitmap) {
                const canvas = document.createElement("canvas");
                canvas.width = extracted.width;
                canvas.height = extracted.height;
                canvas.getContext("2d").drawImage(extracted, 0, 0);
                return normalizeExtracted260705_LY2N7V(canvas);
            }

            if (extracted.imageData) return normalizeExtracted260705_LY2N7V(extracted.imageData);

            if (extracted.data && extracted.width && extracted.height) {
                return canvasFromImageData260705_LY3I8Q(
                    new ImageData(
                        new Uint8ClampedArray(extracted.data),
                        extracted.width,
                        extracted.height
                    )
                );
            }

            return null;
        }

        function extractDrawableCanvas260705_LY5E3D(renderer, drawableID) {
            if (!renderer) return null;

            try {
                if (typeof renderer.extractDrawableScreenSpace === "function") {
                    const canvas = normalizeExtracted260705_LY2N7V(
                        renderer.extractDrawableScreenSpace(drawableID)
                    );
                    if (canvas) return canvas;
                }
            }
            catch (error) {
                console.warn("Transfork layer screen snapshot failed", error);
            }

            try {
                if (typeof renderer.extractDrawable === "function") {
                    const canvas = normalizeExtracted260705_LY2N7V(
                        renderer.extractDrawable(drawableID)
                    );
                    if (canvas) return canvas;
                }
            }
            catch (error) {
                console.warn("Transfork layer drawable snapshot failed", error);
            }

            return null;
        }
        function trimCanvas260705_LY2P6B(source) {
            if (!source?.width || !source?.height) return null;

            const ctx = source.getContext("2d");
            const data = ctx.getImageData(0, 0, source.width, source.height).data;

            let minX = source.width;
            let minY = source.height;
            let maxX = -1;
            let maxY = -1;

            for (let y = 0; y < source.height; y++) {
                for (let x = 0; x < source.width; x++) {
                    if (data[(y * source.width + x) * 4 + 3] <= 5) continue;
                    if (x < minX) minX = x;
                    if (y < minY) minY = y;
                    if (x > maxX) maxX = x;
                    if (y > maxY) maxY = y;
                }
            }

            if (maxX < minX || maxY < minY) return source;

            const tight = document.createElement("canvas");
            tight.width = maxX - minX + 1;
            tight.height = maxY - minY + 1;

            tight.getContext("2d").drawImage(
                source,
                minX,
                minY,
                tight.width,
                tight.height,
                0,
                0,
                tight.width,
                tight.height
            );

            return tight;
        }
        function makeRendererSnapshot260705_LY4E9X(vm, target, rect, zIndex) {
            const source = trimCanvas260705_LY2P6B(
                extractDrawableCanvas260705_LY5E3D(vm.runtime.renderer, target.drawableID)
            );

            const snap = document.createElement("canvas");
            snap.width = source.width;
            snap.height = source.height;
            snap.getContext("2d").drawImage(source, 0, 0);

            Object.assign(snap.style, {
                    position: "fixed",
                    left: rect.left + "px",
                    top: rect.top + "px",
                    width: rect.width + "px",
                    height: rect.height + "px",
                    pointerEvents: "none",
                    zIndex: String(zIndex || 9998),
                    boxSizing: "border-box",
                    userSelect: "none",
                    background: "transparent",
                    visibility: "hidden",
                    transformOrigin: "50% 50%"
            });

            document.body.appendChild(snap);
            return snap;
        }

        function makeCostumeSnapshot260705_LY9P3K(vm, target, drawable, canvas, rect, zIndex) {
            const costume = getCostume260705_LY7D2Q(target);
            const src = getSource260705_LY8M4W(costume);
            if (!src) return null;

            const scale = drawable?.scale || [target.size || 100, target.size || 100];
            const size = costume.size || [1, 1];
            const toScreen = stageScale260705_LY5S1X(canvas, vm);
            const imgW = Math.max(1, size[0] * Math.abs(scale[0]) / 100 * toScreen);
            const imgH = Math.max(1, size[1] * Math.abs(scale[1]) / 100 * toScreen);
            const direction = typeof target.direction === "number" ? target.direction : 90;
            const rotate = direction - 90;
            const flipX = scale[0] < 0 ? -1 : 1;
            const flipY = scale[1] < 0 ? -1 : 1;
            const ghost = typeof target.effects?.ghost === "number" ? target.effects.ghost : 0;
            const wrap = document.createElement("div");
            const img = document.createElement("img");

            Object.assign(wrap.style, {
                    position: "fixed",
                    left: rect.left + "px",
                    top: rect.top + "px",
                    width: rect.width + "px",
                    height: rect.height + "px",
                    pointerEvents: "none",
                    zIndex: String(zIndex || 9998),
                    boxSizing: "border-box",
                    userSelect: "none",
                    overflow: "visible",
                    background: "transparent",
                    opacity: String(Math.max(0, Math.min(1, 1 - ghost / 100))),
                    visibility: "hidden",
                    transformOrigin: "50% 50%"
            });

            Object.assign(img.style, {
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: imgW + "px",
                    height: imgH + "px",
                    maxWidth: "none",
                    maxHeight: "none",
                    objectFit: "fill",
                    pointerEvents: "none",
                    userSelect: "none",
                    transformOrigin: "50% 50%",
                    transform: "translate(-50%, -50%) rotate(" + rotate + "deg) scale(" + flipX + ", " + flipY + ")"
            });

            img.draggable = false;
            img.src = src;
            wrap.appendChild(img);
            document.body.appendChild(wrap);
            return wrap;
        }

        function makeSnapshot260705_LY8A4B(vm, target, drawable, canvas, rect, zIndex) {
            return makeRendererSnapshot260705_LY4E9X(vm, target, rect, zIndex) ||
            makeCostumeSnapshot260705_LY9P3K(vm, target, drawable, canvas, rect, zIndex);
        }

        function getDrawList260705_LY6V2B(renderer) {
            if (Array.isArray(renderer._drawList)) return renderer._drawList;
            if (Array.isArray(renderer._allDrawables)) {
                return renderer._allDrawables.map((drawable, id) => drawable ? id : null).filter(id => id !== null);
            }
            return [];
        }

        function targetByDrawable260705_LY2T9H(vm, drawableID) {
            return vm.runtime.targets.find(target => target && !target.isStage && target.drawableID === drawableID) || null;
        }

        function createOccluders260705_LY3K7R(vm, target, canvas) {
            const renderer = vm.runtime.renderer;
            const drawList = getDrawList260705_LY6V2B(renderer);
            const targetIndex = drawList.indexOf(target.drawableID);
            if (targetIndex < 0) return [];

            const occluders = [];
            drawList.slice(targetIndex + 1).forEach((drawableID, index) => {
                    const other = targetByDrawable260705_LY2T9H(vm, drawableID);
                    if (!other || other === target) return;

                    const drawable = renderer._allDrawables[drawableID];
                    if (!drawable || drawable._visible === false || typeof drawable.getAABB !== "function") return;

                    const rect = screenRect260705_LY4C8N(drawable.getAABB(), canvas, vm);
                    const snap = makeSnapshot260705_LY8A4B(vm, other, drawable, canvas, rect, 9999 + index);
                    if (snap) occluders.push(snap);
            });

            return occluders;
        }

        function setVisible260705_LY8Q1D(nodes, value) {
            nodes.forEach(node => {
                    if (node) node.style.visibility = value ? "visible" : "hidden";
            });
        }

        function remove260705_LY4R5C(nodes) {
            nodes.forEach(node => {
                    if (node?.parentNode) node.remove();
            });
        }

        api.registerModule260705_NS8Q2M("snapshotLayer", {
                screenRect: screenRect260705_LY4C8N,
                makeSnapshot: makeSnapshot260705_LY8A4B,
                createOccluders: createOccluders260705_LY3K7R,
                setVisible: setVisible260705_LY8Q1D,
                remove: remove260705_LY4R5C
        });
})();
