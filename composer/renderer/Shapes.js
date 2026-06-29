// Shapes.js
// Determines Scratch-style block shapes from Blockly-compatible block definitions.

(function (global) {
    "use strict";

    const SHAPES = {
        STACK: "stack",
        HAT: "hat",
        CAP: "cap",
        REPORTER: "reporter",
        BOOLEAN: "boolean",
        C_BLOCK: "c-block",
        END_BLOCK: "end-block"
    };

    function hasValue(value) {
        return value !== undefined && value !== null && value !== false;
    }

    function asArray(value) {
        if (Array.isArray(value)) {
            return value;
        }

        return hasValue(value) ? [value] : [];
    }

    function hasPreviousStatement(blockDefinition) {
        return hasValue(blockDefinition.previousStatement) || !!blockDefinition.previousConnection;
    }

    function hasNextStatement(blockDefinition) {
        return hasValue(blockDefinition.nextStatement) || !!blockDefinition.nextConnection;
    }

    function getOutputChecks(blockDefinition) {
        if (blockDefinition.outputConnection && blockDefinition.outputConnection.getCheck) {
            return asArray(blockDefinition.outputConnection.getCheck());
        }

        if (blockDefinition.outputConnection && blockDefinition.outputConnection.check_) {
            return asArray(blockDefinition.outputConnection.check_);
        }

        return asArray(blockDefinition.output);
    }

    function hasOutput(blockDefinition) {
        return hasValue(blockDefinition.output) || !!blockDefinition.outputConnection;
    }

    function isBooleanOutput(blockDefinition) {
        return getOutputChecks(blockDefinition).some(check => String(check).toLowerCase() === "boolean");
    }

    function getInputs(blockDefinition) {
        if (Array.isArray(blockDefinition.args0)) {
            return blockDefinition.args0;
        }

        if (Array.isArray(blockDefinition.inputList)) {
            return blockDefinition.inputList;
        }

        return [];
    }

    function hasStatementInput(blockDefinition) {
        return getInputs(blockDefinition).some(input => {
            const type = String(input.type || "").toLowerCase();
            const name = String(input.name || "").toLowerCase();

            return type === "input_statement" || type === "statement" || name.includes("substack");
        });
    }

    function hasEndBranchInput(blockDefinition) {
        return getInputs(blockDefinition).some(input => {
            const name = String(input.name || "").toLowerCase();

            return name.includes("else") || name.includes("substack2");
        });
    }

    function getBlockShape(blockDefinition) {
        if (!blockDefinition) {
            // TODO: Add Composer diagnostics for missing block definitions.
            return SHAPES.STACK;
        }

        if (hasOutput(blockDefinition)) {
            return isBooleanOutput(blockDefinition) ? SHAPES.BOOLEAN : SHAPES.REPORTER;
        }

        if (hasStatementInput(blockDefinition)) {
            if (!hasNextStatement(blockDefinition) || hasEndBranchInput(blockDefinition)) {
                // TODO: Blockly does not consistently expose Scratch's visual end-block distinction.
                return SHAPES.END_BLOCK;
            }

            return SHAPES.C_BLOCK;
        }

        if (!hasPreviousStatement(blockDefinition) && hasNextStatement(blockDefinition)) {
            return SHAPES.HAT;
        }

        if (hasPreviousStatement(blockDefinition) && !hasNextStatement(blockDefinition)) {
            // TODO: Some Scratch cap blocks and ordinary terminal stack blocks look identical in Blockly metadata.
            return SHAPES.CAP;
        }

        return SHAPES.STACK;
    }

    const Shapes = {
        getBlockShape
    };

    if (global.Composer) {
        global.Composer.Shapes = Shapes;
    }

    if (typeof global.module !== "undefined" && global.module.exports) {
        global.module.exports = Shapes;
    }

    global.Shapes = Shapes;
})(typeof window !== "undefined" ? window : globalThis);
