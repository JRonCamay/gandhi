window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function normalize(source) {
        if (!source) return null;

        if (source instanceof HTMLCanvasElement) {
            return source.width && source.height ? source : null;
        }

        if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) {
            const canvas = document.createElement("canvas");
            canvas.width = source.width;
            canvas.height = source.height;
            canvas.getContext("2d").drawImage(source, 0, 0);
            return canvas;
        }

        if (typeof ImageData !== "undefined" && source instanceof ImageData) {
            const canvas = document.createElement("canvas");
            canvas.width = source.width;
            canvas.height = source.height;
            canvas.getContext("2d").putImageData(source, 0, 0);
            return canvas;
        }

        if (source.imageData) return normalize(source.imageData);

        if (source.data && source.width && source.height) {
            return normalize(new ImageData(new Uint8ClampedArray(source.data), source.width, source.height));
        }

        return null;
    }

    function extractDrawable(vm, target) {
        const renderer = vm?.runtime?.renderer;
        if (!renderer || !target || typeof renderer.extractDrawable !== "function") return null;

        try {
            return normalize(renderer.extractDrawable(target.drawableID));
        }
        catch (_error) {
            return null;
        }
    }

    function extractScreen(vm, target) {
        const renderer = vm?.runtime?.renderer;
        if (!renderer || !target || typeof renderer.extractDrawableScreenSpace !== "function") return null;

        try {
            return normalize(renderer.extractDrawableScreenSpace(target.drawableID));
        }
        catch (_error) {
            return null;
        }
    }

    function scan(canvas) {
        if (!canvas?.width || !canvas?.height) return null;

        let data;
        try {
            data = canvas.getContext("2d").getImageData(0, 0, canvas.width, canvas.height).data;
        }
        catch (_error) {
            return null;
        }

        let minX = canvas.width;
        let minY = canvas.height;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const alpha = data[(y * canvas.width + x) * 4 + 3];
                if (alpha < 8) continue;
                if (x < minX) minX = x;
                if (y < minY) minY = y;
                if (x > maxX) maxX = x;
                if (y > maxY) maxY = y;
            }
        }

        if (maxX < minX || maxY < minY) return null;
        return { minX, minY, maxX, maxY, width: canvas.width, height: canvas.height };
    }

    function fullRect(vm, target, drawable, stageCanvas) {
        if (!drawable?.getAABB || !api.snapshotLayer?.screenRect) return null;
        return api.snapshotLayer.screenRect(drawable.getAABB(), stageCanvas, vm);
    }

    function screenPoint(vm, stageCanvas, x, y) {
        const native = vm.runtime.renderer.getNativeSize();
        const rect = stageCanvas.getBoundingClientRect();
        return {
            x: rect.left + ((x + native[0] / 2) / native[0]) * rect.width,
            y: rect.top + ((native[1] / 2 - y) / native[1]) * rect.height
        };
    }

    function rectFromPoints(points) {
        const xs = points.map(point => point.x);
        const ys = points.map(point => point.y);
        const left = Math.min(...xs);
        const top = Math.min(...ys);
        const right = Math.max(...xs);
        const bottom = Math.max(...ys);
        return { left, top, width: right - left, height: bottom - top };
    }

    function screenTrimRect(full, bounds) {
        const minX = bounds.minX;
        const minY = bounds.minY;
        const maxX = bounds.maxX;
        const maxY = bounds.maxY;

        return {
            left: full.left + (minX / bounds.width) * full.width,
            top: full.top + (minY / bounds.height) * full.height,
            width: ((maxX - minX + 1) / bounds.width) * full.width,
            height: ((maxY - minY + 1) / bounds.height) * full.height
        };
    }

    function transformedRect(vm, target, drawable, stageCanvas) {
        const source = extractDrawable(vm, target);
        const bounds = scan(source);
        if (!bounds) return null;

        const costume = target?.sprite?.costumes?.[target.currentCostume];
        const size = costume?.size || [bounds.width, bounds.height];
        const centerX = typeof costume?.rotationCenterX === "number" ? costume.rotationCenterX : size[0] / 2;
        const centerY = typeof costume?.rotationCenterY === "number" ? costume.rotationCenterY : size[1] / 2;
        const scale = drawable?.scale || [target.size || 100, target.size || 100];
        const direction = typeof target.direction === "number" ? target.direction : 90;
        const radians = (direction - 90) * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const minX = bounds.minX;
        const minY = bounds.minY;
        const maxX = bounds.maxX;
        const maxY = bounds.maxY;
        const corners = [
            [minX, minY],
            [maxX + 1, minY],
            [maxX + 1, maxY + 1],
            [minX, maxY + 1]
        ];

        return rectFromPoints(corners.map(point => {
            const costumeX = point[0] / bounds.width * size[0];
            const costumeY = point[1] / bounds.height * size[1];
            const localX = (costumeX - centerX) * scale[0] / 100;
            const localY = (centerY - costumeY) * scale[1] / 100;
            const scratchX = target.x + localX * cos - localY * sin;
            const scratchY = target.y + localX * sin + localY * cos;
            return screenPoint(vm, stageCanvas, scratchX, scratchY);
        }));
    }

    function rect(vm, target, drawable, stageCanvas) {
        const transformed = transformedRect(vm, target, drawable, stageCanvas);
        if (transformed) return transformed;

        const full = fullRect(vm, target, drawable, stageCanvas);
        if (!full) return null;

        const screenSource = extractScreen(vm, target);
        const screenBounds = scan(screenSource);
        return screenBounds ? screenTrimRect(full, screenBounds) : full;
    }

    api.registerModule260705_NS8Q2M("pixelBounds", {
        rect,
        fullRect,
        extract: extractDrawable,
        extractScreen,
        scan,
        transformedRect
    });
})();