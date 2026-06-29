// BlockStyle.js
// Reads style and connection metadata from Blockly block definitions.

(function (global) {
    "use strict";

    function emptyStyle() {
        return {
            color: null,
            shape: null,
            previous: false,
            next: false,
            output: false,
            inputs: []
        };
    }

    function getBlockly() {
        if (typeof global.Blockly === "undefined") {
            return null;
        }

        return global.Blockly;
    }

    function createTemporaryWorkspace(Blockly) {
        if (typeof Blockly.Workspace !== "function") {
            return null;
        }

        return new Blockly.Workspace();
    }

    function getConnectionCheck(connection) {
        if (!connection) {
            return null;
        }

        return connection.getCheck ? connection.getCheck() : connection.check_ || null;
    }

    function getBlockShape(block) {
        if (global.Shapes && typeof global.Shapes.getBlockShape === "function") {
            return global.Shapes.getBlockShape(block);
        }

        if (block.outputConnection) {
            return "reporter";
        }

        if (block.previousConnection || block.nextConnection) {
            return "stack";
        }

        // TODO: Detect hat, cap, reporter, boolean, and custom Scratch shapes from Blockly metadata when available.
        return null;
    }

    function getInputs(block) {
        if (!Array.isArray(block.inputList)) {
            return [];
        }

        return block.inputList.map(input => ({
            name: input.name || "",
            type: input.type || null,
            connection: getConnectionCheck(input.connection)
        }));
    }

    function readBlockStyleFromInstance(block) {
        return {
            color: block.getColour ? block.getColour() : block.colour_ || null,
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
            // TODO: Return richer diagnostics when Composer has a shared error/reporting API.
            return emptyStyle();
        }

        const workspace = createTemporaryWorkspace(Blockly);

        if (!workspace || typeof workspace.newBlock !== "function") {
            // TODO: Read directly from JSON block definitions if Blockly cannot create temporary blocks.
            return emptyStyle();
        }

        let block = null;

        try {
            block = workspace.newBlock(blockType);
            return readBlockStyleFromInstance(block);
        } catch (error) {
            // TODO: Surface unknown or malformed block definitions through Composer diagnostics.
            return emptyStyle();
        } finally {
            if (block && typeof block.dispose === "function") {
                block.dispose(false);
            }

            if (typeof workspace.dispose === "function") {
                workspace.dispose();
            }
        }
    }

    const BlockStyle = {
        getBlockStyle
    };

    if (global.Composer) {
        global.Composer.BlockStyle = BlockStyle;
    }

    if (typeof global.module !== "undefined" && global.module.exports) {
        global.module.exports = BlockStyle;
    }

    global.BlockStyle = BlockStyle;
})(typeof window !== "undefined" ? window : globalThis);
