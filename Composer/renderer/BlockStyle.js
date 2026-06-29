// BlockStyle.js
// Reads style and connection metadata from Blockly block definitions.

(function (global) {
    "use strict";

    const CATEGORY_COLORS = {
        motion: "#4C97FF",
        looks: "#9966FF",
        sound: "#CF63CF",
        event: "#FFBF00",
        events: "#FFBF00",
        control: "#FFAB19",
        sensing: "#5CB1D6",
        operator: "#59C059",
        operators: "#59C059",
        data: "#FF8C1A",
        variables: "#FF8C1A",
        lists: "#FF661A",
        procedures: "#FF6680",
        myblocks: "#FF6680"
    };

    const OPCODE_CATEGORY = {
        motion_: "motion",
        looks_: "looks",
        sound_: "sound",
        event_: "events",
        control_: "control",
        sensing_: "sensing",
        operator_: "operators",
        data_: "variables",
        procedures_: "myblocks"
    };

    function emptyStyle(blockType) {
        return {
            blockType: blockType || "",
            category: getCategoryFromType(blockType),
            color: getColorFromType(blockType),
            shape: null,
            previous: false,
            next: false,
            output: false,
            inputs: []
        };
    }

    function getBlockly() {
        return typeof global.Blockly === "undefined" ? null : global.Blockly;
    }

    function normalizeColor(color) {
        if (!color) return null;
        if (typeof color === "number") {
            return "#" + color.toString(16).padStart(6, "0");
        }
        if (typeof color === "string" && color[0] !== "#") {
            return "#" + color;
        }
        return color;
    }

    function getCategoryFromType(blockType) {
        if (!blockType) return null;

        const lower = String(blockType).toLowerCase();

        for (const prefix in OPCODE_CATEGORY) {
            if (lower.startsWith(prefix)) {
                return OPCODE_CATEGORY[prefix];
            }
        }

        return null;
    }

    function getColorFromType(blockType) {
        const category = getCategoryFromType(blockType);
        return category ? CATEGORY_COLORS[category] : null;
    }

    function createTemporaryWorkspace(Blockly) {
        if (typeof Blockly.Workspace !== "function") return null;
        return new Blockly.Workspace();
    }

    function getConnectionCheck(connection) {
        if (!connection) return null;
        return connection.getCheck ? connection.getCheck() : connection.check_ || null;
    }

    function getBlockShape(block) {
        if (global.Shapes && typeof global.Shapes.getBlockShape === "function") {
            return global.Shapes.getBlockShape(block);
        }

        if (block.outputConnection) return "reporter";
        if (block.previousConnection || block.nextConnection) return "stack";

        return null;
    }

    function getInputs(block) {
        if (!Array.isArray(block.inputList)) return [];

        return block.inputList.map(input => ({
            name: input.name || "",
            type: input.type || null,
            connection: getConnectionCheck(input.connection)
        }));
    }

    function readBlockStyleFromInstance(block, blockType) {
        const category = getCategoryFromType(blockType);
        const blockColor = normalizeColor(block.getColour ? block.getColour() : block.colour_);
        const fallbackColor = getColorFromType(blockType);

        return {
            blockType,
            category,
            color: blockColor || fallbackColor,
            shape: getBlockShape(block),
            previous: !!block.previousConnection,
            next: !!block.nextConnection,
            output: !!block.outputConnection,
            inputs: getInputs(block)
        };
    }

    function getBlockStyle(blockType) {
        const Blockly = getBlockly();

        if (!Blockly || !Blockly.Blocks || !Blockly.Blocks[blockType]) {
            return emptyStyle(blockType);
        }

        const workspace = createTemporaryWorkspace(Blockly);

        if (!workspace || typeof workspace.newBlock !== "function") {
            return emptyStyle(blockType);
        }

        let block = null;

        try {
            block = workspace.newBlock(blockType);
            return readBlockStyleFromInstance(block, blockType);
        } catch (error) {
            return emptyStyle(blockType);
        } finally {
            if (block && typeof block.dispose === "function") {
                block.dispose(false);
            }

            if (workspace && typeof workspace.dispose === "function") {
                workspace.dispose();
            }
        }
    }

    const BlockStyle = {
        getBlockStyle,
        getCategoryFromType,
        getColorFromType
    };

    if (global.Composer) {
        global.Composer.BlockStyle = BlockStyle;
    }

    global.BlockStyle = BlockStyle;
})(typeof window !== "undefined" ? window : globalThis);
