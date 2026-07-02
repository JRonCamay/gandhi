const BLOKSEARCH_BLOCK_METRICS = {
    BLOCK_HEIGHT: 48,
    MIN_WIDTH: 60,
    PADDING_X: 16,
    ELEMENT_GAP: 8,

    NOTCH_X: 12,
    NOTCH_WIDTH: 15,
    NOTCH_DEPTH: 8,

    CORNER_RADIUS: 4,
    HAT_PEAK: 24,

    BOOLEAN_POINT: 16,

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
        const shapeStyle = this.getShapeStyle(blockKind);

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
            background: ${entry.color};
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
            box-shadow:
                inset 0 1px 0 rgba(255,255,255,0.18),
                inset 0 -3px 0 rgba(0,0,0,0.25),
                0 1px 2px rgba(0,0,0,0.15);
        `;
    },

    getShapeStyle(kind) {
        if (kind === "boolean") return this.getBooleanStyle();
        if (kind === "reporter") return this.getReporterStyle();
        if (kind === "hat") return this.getHatStyle();
        if (kind === "c") return this.getCBlockStyle();
        if (kind === "cap") return this.getCapStyle();
        return this.getStackStyle();
    },

    getBooleanStyle() {
        const m = BLOKSEARCH_BLOCK_METRICS;

        return `
            min-height: 28px;
            padding: 6px ${m.PADDING_X}px;
            border-radius: 0;
            clip-path: polygon(
                ${m.BOOLEAN_POINT}px 0,
                calc(100% - ${m.BOOLEAN_POINT}px) 0,
                100% 50%,
                calc(100% - ${m.BOOLEAN_POINT}px) 100%,
                ${m.BOOLEAN_POINT}px 100%,
                0 50%
            );
        `;
    },

    getReporterStyle() {
        const m = BLOKSEARCH_BLOCK_METRICS;

        return `
            min-height: 28px;
            padding: 6px ${m.PADDING_X}px;
            border-radius: 999px;
        `;
    },

    getHatStyle() {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const notchEnd = m.NOTCH_X + m.NOTCH_WIDTH;
        const tabStart = m.NOTCH_X;
        const tabEnd = m.NOTCH_X + m.NOTCH_WIDTH;

        return `
            min-height: ${m.BLOCK_HEIGHT}px;
            padding: 18px ${m.PADDING_X}px 8px ${m.PADDING_X}px;
            border-radius: ${m.CORNER_RADIUS}px;
            clip-path: polygon(
                0 ${m.HAT_PEAK}px,
                4px 15px,
                12px 7px,
                24px 2px,
                36px 0,
                48px 2px,
                60px 7px,
                68px 15px,
                72px ${m.HAT_PEAK}px,
                100% ${m.HAT_PEAK}px,
                100% calc(100% - ${m.NOTCH_DEPTH}px),
                ${tabEnd + 24}px calc(100% - ${m.NOTCH_DEPTH}px),
                ${tabEnd + 18}px 100%,
                ${tabStart + 6}px 100%,
                ${tabStart}px calc(100% - ${m.NOTCH_DEPTH}px),
                0 calc(100% - ${m.NOTCH_DEPTH}px)
            );
        `;
    },

    getStackStyle() {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const notchEnd = m.NOTCH_X + m.NOTCH_WIDTH;
        const tabStart = m.NOTCH_X;
        const tabEnd = m.NOTCH_X + m.NOTCH_WIDTH;

        return `
            min-height: ${m.BLOCK_HEIGHT}px;
            padding: 16px ${m.PADDING_X}px 10px ${m.PADDING_X}px;
            border-radius: ${m.CORNER_RADIUS}px;
            clip-path: polygon(
                0 0,
                ${m.NOTCH_X}px 0,
                ${m.NOTCH_X + 6}px ${m.NOTCH_DEPTH}px,
                ${notchEnd + 6}px ${m.NOTCH_DEPTH}px,
                ${notchEnd + 12}px 0,
                100% 0,
                100% calc(100% - ${m.NOTCH_DEPTH}px),
                ${tabEnd + 24}px calc(100% - ${m.NOTCH_DEPTH}px),
                ${tabEnd + 18}px 100%,
                ${tabStart + 6}px 100%,
                ${tabStart}px calc(100% - ${m.NOTCH_DEPTH}px),
                0 calc(100% - ${m.NOTCH_DEPTH}px)
            );
        `;
    },

    getCapStyle() {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const notchEnd = m.NOTCH_X + m.NOTCH_WIDTH;

        return `
            min-height: ${m.BLOCK_HEIGHT}px;
            padding: 16px ${m.PADDING_X}px 10px ${m.PADDING_X}px;
            border-radius: ${m.CORNER_RADIUS}px ${m.CORNER_RADIUS}px 12px 12px;
            clip-path: polygon(
                0 0,
                ${m.NOTCH_X}px 0,
                ${m.NOTCH_X + 6}px ${m.NOTCH_DEPTH}px,
                ${notchEnd + 6}px ${m.NOTCH_DEPTH}px,
                ${notchEnd + 12}px 0,
                100% 0,
                100% 100%,
                0 100%
            );
        `;
    },

    getCBlockStyle() {
        const m = BLOKSEARCH_BLOCK_METRICS;
        const notchEnd = m.NOTCH_X + m.NOTCH_WIDTH;
        const mouthTop = m.C_TOP_BAR;
        const mouthBottom = m.C_TOP_BAR + m.C_EMPTY_MOUTH;
        const totalHeight = m.C_TOP_BAR + m.C_EMPTY_MOUTH + m.C_BOTTOM_WRAP;

        return `
            min-width: 120px;
            min-height: ${totalHeight}px;
            padding: 16px ${m.PADDING_X}px ${m.C_BOTTOM_WRAP + 22}px ${m.PADDING_X}px;
            border-radius: ${m.CORNER_RADIUS}px;
            clip-path: polygon(
                0 0,
                ${m.NOTCH_X}px 0,
                ${m.NOTCH_X + 6}px ${m.NOTCH_DEPTH}px,
                ${notchEnd + 6}px ${m.NOTCH_DEPTH}px,
                ${notchEnd + 12}px 0,
                100% 0,
                100% ${mouthTop}px,
                ${m.C_SPINE_WIDTH}px ${mouthTop}px,
                ${m.C_SPINE_WIDTH}px ${mouthBottom}px,
                100% ${mouthBottom}px,
                100% calc(100% - ${m.NOTCH_DEPTH}px),
                ${notchEnd + 24}px calc(100% - ${m.NOTCH_DEPTH}px),
                ${notchEnd + 18}px 100%,
                ${m.NOTCH_X + 6}px 100%,
                ${m.NOTCH_X}px calc(100% - ${m.NOTCH_DEPTH}px),
                0 calc(100% - ${m.NOTCH_DEPTH}px)
            );
        `;
    }
};