window.BlokSearchBlockShapes = {
    getBlockFrameStyle(entry, maxWidth) {
        const isBooleanBlock = entry.outputCheck && entry.outputCheck.includes("Boolean");
        const isReporterBlock = !isBooleanBlock && entry.hasOutput;
        const isHatBlock =
            entry.type === "event_whenflagclicked" ||
            entry.type === "event_whenkeypressed" ||
            entry.type === "event_whenthisspriteclicked" ||
            entry.type === "event_whenbackdropswitchesto" ||
            entry.type === "event_whengreaterthan" ||
            entry.type === "event_whenbroadcastreceived" ||
            entry.type === "control_start_as_clone";
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
                : isHatBlock
                    ? `
            border-radius: 18px 18px 4px 4px / 16px 16px 4px 4px;
            padding: 9px 12px 7px 16px;
            min-height: 24px;
            clip-path: polygon(
                0 28%,
                4px 14%,
                12px 5%,
                24px 0,
                42px 0,
                56px 5%,
                66px 14%,
                72px 28%,
                100% 28%,
                100% calc(100% - 6px),
                64px calc(100% - 6px),
                58px 100%,
                35px 100%,
                29px calc(100% - 6px),
                0 calc(100% - 6px)
            );
        `
                    : isCBlock
                        ? `
            border-radius: 6px;
            padding: 7px 12px 30px 16px;
            min-height: 54px;
            line-height: 16px;
            clip-path: polygon(
                0 0,
                30px 0,
                36px 10px,
                58px 10px,
                70px 0,
                100% 0,
                100% 32%,
                35px 32%,
                35px 68%,
                100% 68%,
                100% calc(100% - 8px),
                64px calc(100% - 8px),
                58px 100%,
                35px 100%,
                29px calc(100% - 8px),
                0 calc(100% - 8px)
            );
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