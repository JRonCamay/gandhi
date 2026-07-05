window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;

    function sourceFromSnapshot260705_qp9x2m(snapshot) {
        if (snapshot instanceof HTMLCanvasElement) return snapshot;
        return snapshot?.querySelector?.("canvas,img") || null;
    }

    function scanAlpha260705_qp9x2m(canvas, origin) {
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

        const pad = 1;
        const left = Math.max(0, minX - pad);
        const top = Math.max(0, minY - pad);
        const right = Math.min(canvas.width - 1, maxX + pad);
        const bottom = Math.min(canvas.height - 1, maxY + pad);

        return {
            left: origin.left + left,
            top: origin.top + top,
            width: right - left + 1,
            height: bottom - top + 1
        };
    }

    function parseTransform260705_qp9x2m(text) {
        const scale = /scale\(([-0-9.]+),\s*([-0-9.]+)\)/.exec(text || "");
        const rotate = /rotate\(([-0-9.]+)deg\)/.exec(text || "");
        return {
            sx: scale ? Number(scale[1]) || 1 : 1,
            sy: scale ? Number(scale[2]) || 1 : 1,
            rotate: rotate ? Number(rotate[1]) || 0 : 0
        };
    }

    function rect260705_qp9x2m(toolState) {
        const snapshot = toolState?.snapshot;
        const base = toolState?.rect;
        const source = sourceFromSnapshot260705_qp9x2m(snapshot);
        if (!snapshot || !base || !source) return null;
        if (source instanceof HTMLImageElement && !source.complete) return null;

        const box = snapshot.getBoundingClientRect();
        if (box.width < 1 || box.height < 1) return null;

        const temp = document.createElement("canvas");
        temp.width = Math.max(1, Math.ceil(box.width));
        temp.height = Math.max(1, Math.ceil(box.height));

        const ctx = temp.getContext("2d");
        const parsed = parseTransform260705_qp9x2m(snapshot.style.transform);

        try {
            ctx.translate(temp.width / 2, temp.height / 2);
            ctx.rotate(parsed.rotate * Math.PI / 180);
            ctx.scale(parsed.sx, parsed.sy);
            ctx.drawImage(source, -base.width / 2, -base.height / 2, base.width, base.height);
        }
        catch (_error) {
            return null;
        }

        return scanAlpha260705_qp9x2m(temp, box);
    }

    function install260705_qp9x2m() {
        if (!api.selectionBox || api.selectionBox.__livePixelScan260705_qp9x2m) return;
        if (typeof api.selectionBox.place !== "function") return;

        const oldPlace = api.selectionBox.place;
        api.selectionBox.place = function (rect) {
            const tool = api.snapshotToolsPixel;
            if (window.__transforkTransformActive && tool?.state?.active) {
                const scanned = rect260705_qp9x2m(tool.state);
                if (scanned) rect = scanned;
            }
            return oldPlace.call(this, rect);
        };

        api.selectionBox.__livePixelScan260705_qp9x2m = true;
    }

    function boot260705_qp9x2m() {
        install260705_qp9x2m();
        if (!api.selectionBox?.__livePixelScan260705_qp9x2m) requestAnimationFrame(boot260705_qp9x2m);
    }

    boot260705_qp9x2m();

    api.registerModule260705_NS8Q2M("snapshotLivePixelScan", {
        rect: rect260705_qp9x2m,
        install: install260705_qp9x2m
    });
})();
