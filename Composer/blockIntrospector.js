// blockIntrospector.js
(function (global) {
"use strict";

const CACHE = new Map();

const LABEL = "label";
const INPUT = "input";

const TYPE_NUMBER = "number";
const TYPE_STRING = "string";
const TYPE_BOOLEAN = "boolean";
const TYPE_COLOR = "color";
const TYPE_REPORTER = "reporter";
const TYPE_STACK = "stack";
const TYPE_MENU = "menu";

const Introspector = {};

Introspector.inspect = function (opcode) {

    opcode = String(opcode || "");

    if (!opcode) return null;

    if (CACHE.has(opcode)) {
        return CACHE.get(opcode);
    }

    const workspace = getWorkspace();

    if (!workspace) return null;

    const block = createTemporaryBlock(workspace, opcode);

    if (!block) return null;

    const info = inspectBlock(block);

    CACHE.set(opcode, info);

    try {
        block.dispose(false);
    } catch (e) {}

    return info;

};

Introspector.clearCache = function () {

    CACHE.clear();

};

function getWorkspace() {

    if (
        window.Blockly &&
        Blockly.getMainWorkspace
    ) {
        return Blockly.getMainWorkspace();
    }

    return null;

}

function createTemporaryBlock(workspace, opcode) {

    try {

        const Events = Blockly.Events;

        if (Events && Events.disable) {
            Events.disable();
        }

        const block = workspace.newBlock(opcode);

        if (block.initSvg) block.initSvg();

        return block;

    } catch (e) {

        return null;

    } finally {

        const Events = Blockly.Events;

        if (Events && Events.enable) {
            Events.enable();
        }

    }

}

function inspectBlock(block) {

    return {

        opcode: block.type,

        category: getCategory(block),

        color: getColor(block),

        shape: getShape(block),

        previous: !!block.previousConnection,

        next: !!block.nextConnection,

        output: !!block.outputConnection,

        parts: [],

        params: [],

        pattern: "",

        preview: ""

    };

}

function getCategory(block) {

    if (
        global.Composer &&
        Composer.BlockStyle &&
        Composer.BlockStyle.getCategoryFromType
    ) {
        return Composer.BlockStyle.getCategoryFromType(block.type);
    }

    return String(block.type).split("_")[0];

}

function getColor(block) {

    if (block.getColour) {

        return block.getColour();

    }

    return block.colour_;

}

function getShape(block) {

    if (
        global.Composer &&
        Composer.Shapes
    ) {

        return Composer.Shapes.getBlockShape(block);

    }

    return "stack";

}

global.Composer = global.Composer || {};

global.Composer.introspector = Introspector;

})(window);
