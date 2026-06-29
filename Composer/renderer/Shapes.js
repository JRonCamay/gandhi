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

    const OPCODE_SHAPES = {
        event_whenflagclicked: SHAPES.HAT,
        event_whenkeypressed: SHAPES.HAT,
        event_whenthisspriteclicked: SHAPES.HAT,
        event_whenbackdropswitchesto: SHAPES.HAT,
        event_whengreaterthan: SHAPES.HAT,
        event_whenbroadcastreceived: SHAPES.HAT,

        control_repeat: SHAPES.C_BLOCK,
        control_forever: SHAPES.END_BLOCK,
        control_if: SHAPES.C_BLOCK,
        control_if_else: SHAPES.END_BLOCK,
        control_repeat_until: SHAPES.C_BLOCK,
        control_stop: SHAPES.CAP,
        control_delete_this_clone: SHAPES.CAP,

        sensing_touchingobject: SHAPES.BOOLEAN,
        sensing_touchingcolor: SHAPES.BOOLEAN,
        sensing_coloristouchingcolor: SHAPES.BOOLEAN,
        sensing_keypressed: SHAPES.BOOLEAN,
        sensing_mousedown: SHAPES.BOOLEAN,

        sensing_answer: SHAPES.REPORTER,
        sensing_distanceto: SHAPES.REPORTER,
        sensing_mousex: SHAPES.REPORTER,
        sensing_mousey: SHAPES.REPORTER,

        operator_add: SHAPES.REPORTER,
        operator_subtract: SHAPES.REPORTER,
        operator_multiply: SHAPES.REPORTER,
        operator_divide: SHAPES.REPORTER,
        operator_random: SHAPES.REPORTER,
        operator_join: SHAPES.REPORTER,
        operator_letter_of: SHAPES.REPORTER,
        operator_length: SHAPES.REPORTER,
        operator_mod: SHAPES.REPORTER,
        operator_round: SHAPES.REPORTER,
        operator_mathop: SHAPES.REPORTER,

        operator_lt: SHAPES.BOOLEAN,
        operator_equals: SHAPES.BOOLEAN,
        operator_gt: SHAPES.BOOLEAN,
        operator_and: SHAPES.BOOLEAN,
        operator_or: SHAPES.BOOLEAN,
        operator_not: SHAPES.BOOLEAN,
        operator_contains: SHAPES.BOOLEAN
    };

    const SUPPORTED_SHAPES = Object.keys(SHAPES).map(key => SHAPES[key]);

    function getType(blockDefinition) {
        return String(
            blockDefinition.type ||
            blockDefinition.blockType ||
            blockDefinition.opcode ||
            blockDefinition.block ||
            blockDefinition.id ||
            ""
        );
    }

    function hasValue(value) {
        return value !== undefined && value !== null && value !== false;
    }

    function asArray(value) {
        return Array.isArray(value) ? value : (hasValue(value) ? [value] : []);
    }

    function hasPreviousStatement(blockDefinition) {
        return blockDefinition.previous === true ||
            hasValue(blockDefinition.previousStatement) ||
            !!blockDefinition.previousConnection;
    }

    function hasNextStatement(blockDefinition) {
        return blockDefinition.next === true ||
            hasValue(blockDefinition.nextStatement) ||
            !!blockDefinition.nextConnection;
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
        return blockDefinition.output === true ||
            hasValue(blockDefinition.output) ||
            !!blockDefinition.outputConnection;
    }

    function isBooleanOutput(blockDefinition) {
        const type = getType(blockDefinition).toLowerCase();

        if (OPCODE_SHAPES[type] === SHAPES.BOOLEAN) {
            return true;
        }

        return getOutputChecks(blockDefinition).some(check =>
            String(check).toLowerCase() === "boolean"
        );
    }

    function getInputs(blockDefinition) {
        if (Array.isArray(blockDefinition.args0)) return blockDefinition.args0;
        if (Array.isArray(blockDefinition.inputList)) return blockDefinition.inputList;
        if (Array.isArray(blockDefinition.inputs)) return blockDefinition.inputs;
        return [];
    }

    function hasStatementInput(blockDefinition) {
        return getInputs(blockDefinition).some(input => {
            const type = String(input.type || "").toLowerCase();
            const name = String(input.name || "").toLowerCase();

            return type === "input_statement" ||
                type === "statement" ||
                name.includes("substack");
        });
    }

    function hasElseInput(blockDefinition) {
        return getInputs(blockDefinition).some(input => {
            const name = String(input.name || "").toLowerCase();
            return name.includes("else") || name.includes("substack2");
        });
    }

    function getBlockShape(blockDefinition) {
        if (!blockDefinition) return SHAPES.STACK;

        const type = getType(blockDefinition).toLowerCase();

        if (OPCODE_SHAPES[type]) {
            return OPCODE_SHAPES[type];
        }

        if (SUPPORTED_SHAPES.includes(blockDefinition.shape)) {
            return blockDefinition.shape;
        }

        if (hasOutput(blockDefinition)) {
            return isBooleanOutput(blockDefinition) ? SHAPES.BOOLEAN : SHAPES.REPORTER;
        }

        if (hasStatementInput(blockDefinition)) {
            return hasElseInput(blockDefinition) ? SHAPES.END_BLOCK : SHAPES.C_BLOCK;
        }

        if (!hasPreviousStatement(blockDefinition) && hasNextStatement(blockDefinition)) {
            return SHAPES.HAT;
        }

        if (hasPreviousStatement(blockDefinition) && !hasNextStatement(blockDefinition)) {
            return SHAPES.CAP;
        }

        return SHAPES.STACK;
    }

    const Shapes = {
        SHAPES,
        getBlockShape
    };

    if (global.Composer) {
        global.Composer.Shapes = Shapes;
    }

    global.Shapes = Shapes;
})(typeof window !== "undefined" ? window : globalThis);
