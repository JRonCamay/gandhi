const BLOKSEARCH_BLOCK_METRICS = {
    BLOCK_HEIGHT: 48,
    MIN_WIDTH: 60,
    PADDING_X: 16,
    ELEMENT_GAP: 8,

    NOTCH_X: 12,
    NOTCH_WIDTH: 15,
    NOTCH_DEPTH: 8,
    NOTCH_SHOULDER: 6,

    CORNER_RADIUS: 4,
    HAT_PEAK: 24,

    BOOLEAN_POINT: 12,

    C_WIDTH: 128,
    C_TOP_BAR: 40,
    C_SPINE_WIDTH: 16,
    C_EMPTY_MOUTH: 24,
    C_BOTTOM_WRAP: 16,

    FONT_SIZE: 12,
    FONT_WEIGHT: 700
};

window.BlokSearchBlockShapes = {
    metrics: BLOKSEARCH_BLOCK_METRICS,

    getBlockFrameStyle(entry, maxWidth) {
        const blockKind = this.getBlockKind(entry);
        const shapeStyle = this.getShapeStyle(blockKind, entry.color);

        return `
            ${this.getBaseStyle(entry, maxWidth)}
            ${shapeStyle}
        `;
    },

    getBlockKind(entry) {
        const isBooleanBlock = entry.outputCheck && entry.outputCheck.includes("Boolean");

        if (isBooleanBlock) return "boolean";
        if (entry.hasOutput) return "reporter";

        if (this.isHatBlock(entry.type)) return "hat";
        if (this.isCBlock(entry.type)) return "c";
        if (this.isCapBlock(entry.type)) return "cap";

        return "stack";
    },

    isHatBlock(type) {
        return [
            "event_whenflagclicked",
            "event_whenkeypressed",
            "event_whenthisspriteclicked",
            "event_whenbackdropswitchesto",
            "event_whengreaterthan",
            "event_whenbroadcastreceived",
            "control_start_as_clone"
        ].includes(type);
    },

    isCBlock(type) {
        return [
            "control_if",
            "control_if_else",
            "control_forever",
            "control_repeat",
            "control_repeat_until"
        ].includes(type);
    },

    isCapBlock(type) {
        return [
            "control_stop",
            "control_delete_this_clone"
        ].includes(type);
    },

    getBaseStyle(entry, maxWidth) {
        const m = BLOKSEARCH_BLOCK_METRICS;

        return `
            box-sizing: border-box;
            display: inline-block;
            position: relative;
            width: fit-content;
            background-color: transparent;
            color: #fff;
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: ${m.FONT_SIZE}px;
            font-weight: ${m.FONT_WEIGHT};
            line-height: 16px;
            text-shadow: 0 1px 0 rgba(0,0,0,0.18);
            max-width: ${maxWidth};
            min-width: ${m.MIN_WIDTH}px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            filter: drop-shadow(0 1px 1px rgba(0,0,0,0.22));
            background-repeat: no-repeat;
            background-size: 100% 100%;
            background-position: center center;
            vertical-align: middle;
        `;
    },

    getShapeStyle(kind, color) {
        if (kind === "boolean") return this.getBooleanStyle(color);
        if (kind === "reporter") return this.getReporterStyle(color);
        if (kind === "hat") return this.getHatStyle(color);
        if (kind === "c") return this.getCBlockStyle(color);
        if (kind === "cap") return this.getCapStyle(color);
        return this.getStackStyle(color);
    },

    getBooleanStyle(color) {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const w = 120;
        const h = 32;
        const p = m.BOOLEAN_POINT;
        const path = [
            `M ${p + 2} 1`,
            `H ${w - p - 2}`,
            `Q ${w - p} 1 ${w - p + 2} 3`,
            `L ${w - 2} ${h / 2 - 1}`,
            `Q ${w} ${h / 2} ${w - 2} ${h / 2 + 1}`,
            `L ${w - p + 2} ${h - 3}`,
            `Q ${w - p} ${h - 1} ${w - p - 2} ${h - 1}`,
            `H ${p + 2}`,
            `Q ${p} ${h - 1} ${p - 2} ${h - 3}`,
            `L 2 ${h / 2 + 1}`,
            `Q 0 ${h / 2} 2 ${h / 2 - 1}`,
            `L ${p - 2} 3`,
            `Q ${p} 1 ${p + 2} 1 Z`
        ].join(" ");

        return `
            min-height: ${h}px;
            padding: 8px ${m.PADDING_X}px;
            ${this.getSvgBackground(path, w, h, color)}
        `;
    },

    getReporterStyle(color) {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const w = 120;
        const h = 32;
        const r = h / 2;
        const path = `M ${r} 1 H ${w - r} A ${r - 1} ${r - 1} 0 0 1 ${w - r} ${h - 1} H ${r} A ${r - 1} ${r - 1} 0 0 1 ${r} 1 Z`;

        return `
            min-height: ${h}px;
            padding: 8px ${m.PADDING_X}px;
            ${this.getSvgBackground(path, w, h, color)}
        `;
    },

    getHatStyle(color) {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const w = 160;
        const h = m.BLOCK_HEIGHT;
        const d = m.NOTCH_DEPTH;
        const x = m.NOTCH_X;
        const nw = m.NOTCH_WIDTH;
        const path = [
            `M 1 ${m.HAT_PEAK}`,
            `C 5 11 17 1 36 1`,
            `C 55 1 68 11 72 ${m.HAT_PEAK}`,
            `H ${w - m.CORNER_RADIUS}`,
            `Q ${w - 1} ${m.HAT_PEAK} ${w - 1} ${m.HAT_PEAK + m.CORNER_RADIUS}`,
            `V ${h - d}`,
            this.getBottomBumpPath(x, nw, d, h),
            `H 1 Z`
        ].join(" ");

        return `
            min-height: ${h}px;
            padding: 19px ${m.PADDING_X}px 8px ${m.PADDING_X}px;
            ${this.getSvgBackground(path, w, h, color)}
        `;
    },

    getStackStyle(color) {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const w = 160;
        const h = m.BLOCK_HEIGHT;
        const path = this.getStackPath(w, h, true, true);

        return `
            min-height: ${h}px;
            padding: 15px ${m.PADDING_X}px 10px ${m.PADDING_X}px;
            ${this.getSvgBackground(path, w, h, color)}
        `;
    },

    getCapStyle(color) {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const w = 160;
        const h = m.BLOCK_HEIGHT;
        const path = this.getStackPath(w, h, true, false);

        return `
            min-height: ${h}px;
            padding: 15px ${m.PADDING_X}px 10px ${m.PADDING_X}px;
            ${this.getSvgBackground(path, w, h, color)}
        `;
    },

    getCBlockStyle(color) {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const w = m.C_WIDTH;
        const h = m.C_TOP_BAR + m.C_EMPTY_MOUTH + m.C_BOTTOM_WRAP;
        const x = m.NOTCH_X;
        const nw = m.NOTCH_WIDTH;
        const d = m.NOTCH_DEPTH;
        const r = m.CORNER_RADIUS;
        const spine = m.C_SPINE_WIDTH;
        const mouthTop = m.C_TOP_BAR;
        const mouthBottom = m.C_TOP_BAR + m.C_EMPTY_MOUTH;

        const path = [
            `M ${r} 1`,
            this.getTopNotchPath(x, nw, d),
            `H ${w - r}`,
            `Q ${w - 1} 1 ${w - 1} ${r}`,
            `V ${mouthTop - r}`,
            `Q ${w - 1} ${mouthTop} ${w - r} ${mouthTop}`,
            `H ${spine + r}`,
            `Q ${spine} ${mouthTop} ${spine} ${mouthTop + r}`,
            `V ${mouthBottom - r}`,
            `Q ${spine} ${mouthBottom} ${spine + r} ${mouthBottom}`,
            `H ${w - r}`,
            `Q ${w - 1} ${mouthBottom} ${w - 1} ${mouthBottom + r}`,
            `V ${h - d}`,
            this.getBottomBumpPath(x, nw, d, h),
            `H 1`,
            `V ${r}`,
            `Q 1 1 ${r} 1 Z`
        ].join(" ");

        return `
            min-width: ${w}px;
            min-height: ${h}px;
            padding: 15px ${m.PADDING_X}px ${m.C_BOTTOM_WRAP + 22}px ${m.PADDING_X}px;
            ${this.getSvgBackground(path, w, h, color, this.getLoopArrowSvg(w, h))}
        `;
    },

    getStackPath(w, h, hasPrevious, hasNext) {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const x = m.NOTCH_X;
        const nw = m.NOTCH_WIDTH;
        const d = m.NOTCH_DEPTH;
        const r = m.CORNER_RADIUS;
        const top = hasPrevious ? this.getTopNotchPath(x, nw, d) : `H ${w - r}`;
        const bottom = hasNext
            ? `V ${h - d} ${this.getBottomBumpPath(x, nw, d, h)} H 1`
            : `V ${h - r} Q ${w - 1} ${h - 1} ${w - r} ${h - 1} H ${r} Q 1 ${h - 1} 1 ${h - r}`;

        return [
            `M ${r} 1`,
            top,
            `H ${w - r}`,
            `Q ${w - 1} 1 ${w - 1} ${r}`,
            bottom,
            `V ${r}`,
            `Q 1 1 ${r} 1 Z`
        ].join(" ");
    },

    getTopNotchPath(x, width, depth) {
        const s = BLOKSEARCH_BLOCK_METRICS.NOTCH_SHOULDER;

        return [
            `H ${x}`,
            `C ${x + 2} 1 ${x + 3} ${depth} ${x + s} ${depth}`,
            `H ${x + width + s}`,
            `C ${x + width + s + 3} ${depth} ${x + width + s + 4} 1 ${x + width + (s * 2)} 1`
        ].join(" ");
    },

    getBottomBumpPath(x, width, depth, h) {
        const s = BLOKSEARCH_BLOCK_METRICS.NOTCH_SHOULDER;
        const y = h - depth;

        return [
            `H ${x + width + (s * 2)}`,
            `C ${x + width + s + 4} ${y} ${x + width + s + 3} ${h - 1} ${x + width + s} ${h - 1}`,
            `H ${x + s}`,
            `C ${x + 3} ${h - 1} ${x + 2} ${y} ${x} ${y}`
        ].join(" ");
    },

    getLoopArrowSvg(w, h) {
        return `
            <path d="M ${w - 34} ${h - 20} C ${w - 24} ${h - 12} ${w - 15} ${h - 18} ${w - 15} ${h - 28}"
                fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
            <path d="M ${w - 21} ${h - 29} L ${w - 14} ${h - 29} L ${w - 15} ${h - 22} Z"
                fill="#fff"/>
        `;
    },

    getSvgBackground(path, width, height, color, extraSvg = "") {
        const stroke = this.darkenColor(color, 0.78);
        const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
                <path d="${path}" fill="${color}" stroke="${stroke}" stroke-width="1"/>
                <path d="${path}" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="1" transform="translate(0 1)"/>
                <path d="${path}" fill="none" stroke="rgba(0,0,0,0.18)" stroke-width="2" transform="translate(0 -1)"/>
                ${extraSvg}
            </svg>
        `;

        return `background-image: url("data:image/svg+xml,${encodeURIComponent(svg)}");`;
    },

    darkenColor(color, factor) {
        if (!color || !color.startsWith("#") || color.length !== 7) return "rgba(0,0,0,0.28)";

        const r = Math.round(parseInt(color.slice(1, 3), 16) * factor);
        const g = Math.round(parseInt(color.slice(3, 5), 16) * factor);
        const b = Math.round(parseInt(color.slice(5, 7), 16) * factor);

        return `rgb(${r},${g},${b})`;
    }
};