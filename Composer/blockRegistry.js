// blockRegistry.js
(function (global) {
"use strict";

const Registry = {};

let workspace = null;
let scratchBlocks = null;
let registry = null;

Registry.ready = false;

Registry.refresh = function () {

    workspace = getWorkspace();

    if (!workspace) {
        Registry.ready = false;
        return false;
    }

    scratchBlocks = getScratchBlocks(workspace);

    if (!scratchBlocks) {
        Registry.ready = false;
        return false;
    }

    registry = getRegistryObject(workspace, scratchBlocks);

    if (!registry) {
        Registry.ready = false;
        return false;
    }

    Registry.ready = true;

    console.log(
        "[Composer.registry] Loaded",
        Object.keys(registry).length,
        "definitions"
    );

    return true;

};

Registry.get = function (opcode) {

    if (!Registry.ready) {
        Registry.refresh();
    }

    return registry[String(opcode)] || null;

};

Registry.has = function (opcode) {

    return !!Registry.get(opcode);

};

Registry.getAll = function () {

    if (!Registry.ready) {
        Registry.refresh();
    }

    return registry;

};

Registry.getOpcodes = function () {

    if (!Registry.ready) {
        Registry.refresh();
    }

    return Object.keys(registry);

};

Registry.count = function () {

    return Registry.getOpcodes().length;

};

Registry.getWorkspace = function () {

    if (!Registry.ready) {
        Registry.refresh();
    }

    return workspace;

};

Registry.getScratchBlocks = function () {

    if (!Registry.ready) {
        Registry.refresh();
    }

    return scratchBlocks;

};

Registry.getProcedures = function () {

    if (!Registry.ready) {
        Registry.refresh();
    }

    if (workspace.getProcedureMap) {
        return workspace.getProcedureMap();
    }

    return workspace.globalProcedureMap_ ||
           workspace.procedureMap_ ||
           null;

};

function getWorkspace() {

    if (
        global.Blockly &&
        Blockly.getMainWorkspace
    ) {
        return Blockly.getMainWorkspace();
    }

    return null;

}

function getScratchBlocks(ws) {

    if (
        typeof ws.getScratchBlocks === "function"
    ) {
        return ws.getScratchBlocks();
    }

    if (
        ws.resizeHandlerWrapper_ &&
        ws.resizeHandlerWrapper_[0] &&
        ws.resizeHandlerWrapper_[0][0] &&
        ws.resizeHandlerWrapper_[0][0].Blockly
    ) {
        return ws.resizeHandlerWrapper_[0][0].Blockly;
    }

    return null;

}

function getRegistryObject(ws, ScratchBlocks) {

    if (
        typeof ws.getScratchBlocksBlocks === "function"
    ) {
        const defs = ws.getScratchBlocksBlocks();

        if (defs) return defs;
    }

    if (
        ScratchBlocks &&
        ScratchBlocks.Blocks
    ) {
        return ScratchBlocks.Blocks;
    }

    return null;

}

global.Composer = global.Composer || {};

global.Composer.registry = Registry;

})(window);
