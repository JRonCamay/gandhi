window.BlokSearchBlockShapes = {
    getBlockFrameStyle(entry, maxWidth) {
        const isBooleanBlock = entry.outputCheck && entry.outputCheck.includes("Boolean");
        const isReporterBlock = !isBooleanBlock && entry.hasOutput;
        const isCBlock =
            entry.type === "control_if" ||
            entry.type === "control_if_else" ||
            entry.type === "control_forever" ||
            entry.type === "control_repeat" ||
            entry.type === "control_repeat_until";
        const shapeStyle = isBooleanBlock
            ? `
            border-radius: 0;
            clip-path: polygon(
                10px 0%,
                calc(100% - 10px) 0%,
                100% 50%,
                calc(100% - 10px) 100%,
                10px 100%,
                0% 50%
            );
        `
            : isReporterBlock
                ? `
            border-radius: 999px;
            clip-path: none;
        `
                : isCBlock
                    ? `
            border-radius: 4px;
            padding: 5px 12px 18px 16px;
            min-height: 34px;
            clip-path: polygon(
                0 0,
                30px 0,
                35px 6px,
                58px 6px,
                64px 0,
                100% 0,
                100% 100%,
                64px 100%,
                58px calc(100% - 6px),
                35px calc(100% - 6px),
                29px 100%,
                0 100%
            );
            background-image:
                linear-gradient(
                    to bottom,
                    transparent 0,
                    transparent 18px,
                    rgba(0,0,0,0.28) 18px,
                    rgba(0,0,0,0.28) 24px,
                    transparent 24px
                );
            background-blend-mode: multiply;
        `
                : `
            border-radius: 4px;
            clip-path: polygon(
                0 0,
                30px 0,
                35px 5px,
                58px 5px,
                63px 0,
                100% 0,
                100% calc(100% - 6px),
                64px calc(100% - 6px),
                58px 100%,
                35px 100%,
                29px calc(100% - 6px),
                0 calc(100% - 6px)
            );
        `;

        return `
            background: ${entry.color};
            color: white;
            padding: 5px 10px;
            font-size: 11px;
            font-weight: 500;
            ${shapeStyle}
            border-left: 12px solid rgba(0,0,0,0.15);
            box-shadow: inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -3px 0 rgba(0,0,0,0.28), 0 1px 2px rgba(0,0,0,0.15);
            max-width: ${maxWidth};
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
    }
};