window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function normalize260705_PB8N2Q(source) {
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

        if (source.imageData) return normalize260705_PB8N2Q(source.imageData);
        if (source.data && source.width && source.height) {
            return normalize260705_PB8N2Q(new ImageData(new Uint8ClampedArray(source.data), source.width, source.height));
        }

        return null;
    }

    function extract260705_PB2C7M(vm, target) {
        const renderer = vm?.runtime?.renderer;
        if (!renderer || !target) return null;

        try {
            if (typeof renderer.extractDrawableScreenSpace === "function") {
                const canvas = normalize260705_PB8N2Q(renderer.extractDrawableScreenSpace(target.drawableID));
                if (canvas) return canvas;
            }
        }
        catch (_error) {}

        try {
            if (typeof renderer.extractDrawable === "function") {
                const canvas = normalize260705_PB8N2Q(renderer.extractDrawable(target.drawableID));
                if (canvas) return canvas;
            }
        }
        catch (_error) {}

        return null;
    }

    function scan260705_PB7K4D(canvas) {
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

    function fullRect260705_PB5R9H(vm, target, drawable, stageCanvas) {
        if (!drawable?.getAABB || !api.snapshotLayer?.screenRect) return null;
        return api.snapshotLayer.screenRect(drawable.getAABB(), stageCanvas, vm);
    }

    function rect260705_PB9T3V(vm, target, drawable, stageCanvas) {
        const full = fullRect260705_PB5R9H(vm, target, drawable, stageCanvas);
        if (!full) return null;

        const canvas = extract260705_PB2C7M(vm, target);
        const scan = scan260705_PB7K4D(canvas);
        if (!scan) return full;

        const pad = 1;
        const minX = Math.max(0, scan.minX - pad);
        const minY = Math.max(0, scan.minY - pad);
        const maxX = Math.min(scan.width - 1, scan.maxX + pad);
        const maxY = Math.min(scan.height - 1, scan.maxY + pad);

        return {
            left: full.left + (minX / scan.width) * full.width,
            top: full.top + (minY / scan.height) * full.height,
            width: ((maxX - minX + 1) / scan.width) * full.width,
            height: ((maxY - minY + 1) / scan.height) * full.height
        };
    }

    api.registerModule260705_NS8Q2M("pixelBounds", {
        rect: rect260705_PB9T3V,
        fullRect: fullRect260705_PB5R9H,
        extract: extract260705_PB2C7M,
        scan: scan260705_PB7K4D
    });
})();
