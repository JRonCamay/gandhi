// blockDatabase.js
(function () {

const db = {};

Composer.blocks = db;

const CACHE_KEY = "composer-block-database-v1";
const CACHE_VERSION = 1;

db.ready = false;
db.version = 0;
db.signature = "";

db.all = [];
db.list = db.all;

db.byOpcode = {};
db.byPattern = {};
db.byCategory = {};
db.byPrefix = {};

const FALLBACK_PATTERNS = {
    motion_xposition: {
        pattern: "x position",
        preview: "x position",
        params: []
    },

    motion_yposition: {
        pattern: "y position",
        preview: "y position",
        params: []
    },

    motion_direction: {
        pattern: "direction",
        preview: "direction",
        params: []
    },

    looks_size: {
        pattern: "size",
        preview: "size",
        params: []
    },

    looks_costumenumbername: {
        pattern: "costume []",
        preview: "costume ()",
        params: [
            { name: "property", type: "menu" }
        ]
    },

    looks_backdropnumbername: {
        pattern: "backdrop []",
        preview: "backdrop ()",
        params: [
            { name: "property", type: "menu" }
        ]
    },

    sound_volume: {
        pattern: "volume",
        preview: "volume",
        params: []
    },

    sensing_timer: {
        pattern: "timer",
        preview: "timer",
        params: []
    },

    sensing_loudness: {
        pattern: "loudness",
        preview: "loudness",
        params: []
    },

    sensing_current: {
        pattern: "current []",
        preview: "current ()",
        params: [
            { name: "property", type: "menu" }
        ]
    },

    sensing_dayssince2000: {
        pattern: "days since 2000",
        preview: "days since 2000",
        params: []
    },

    sensing_username: {
        pattern: "username",
        preview: "username",
        params: []
    }
};

/*=========================================
    PUBLIC API
=========================================*/

db.rebuild = function (force) {

    const workspace = getWorkspace();
    const registry = getRegistry(workspace);
    const procedures = getProcedures(workspace);
    const signature = getSignature(registry, procedures);

    if (!force && loadFromCache(signature)) {
        console.log(
            "[Composer.blocks] Loaded from cache:",
            db.all.length,
            "blocks"
        );

        return db.all;
    }

    clear();

    addManualLibrary();
    addRegistryBlocks(workspace, registry);
    addProcedureBlocks(procedures);

    buildIndexes();

    db.ready = true;
    db.version++;
    db.signature = signature;

    saveToCache();

    console.log(
        "[Composer.blocks] Ready:",
        db.all.length,
        "blocks"
    );

    return db.all;

};

db.refresh = function () {

    return db.rebuild(true);

};

db.getAll = function () {

    if (!db.ready) {
        db.rebuild(false);
    }

    return db.all;

};

db.find = function (idOrOpcodeOrPattern) {

    if (!db.ready) {
        db.rebuild(false);
    }

    const key = String(idOrOpcodeOrPattern || "");
    const patternKey = normalize(key);

    return db.byOpcode[key] ||
        db.byOpcode[patternKey] ||
        db.byPattern[patternKey] ||
        null;

};

db.search = function (text) {

    if (!db.ready) {
        db.rebuild(false);
    }

    const query = normalize(text);

    if (!query) {
        return [];
    }

    return db.all
        .map(block => ({
            block,
            score: scoreBlock(query, block)
        }))
        .filter(item => item.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }

            return a.block.pattern.length - b.block.pattern.length;
        })
        .map(item => item.block);

};

db.prefix = function (text) {

    if (!db.ready) {
        db.rebuild(false);
    }

    return db.byPrefix[normalize(text)] || [];

};

/*=========================================
    REBUILD SOURCES
=========================================*/

function clear() {

    db.all = [];
    db.list = db.all;

    db.byOpcode = {};
    db.byPattern = {};
    db.byCategory = {};
    db.byPrefix = {};

}

function addManualLibrary() {

    if (!Array.isArray(Composer.library)) {
        return;
    }

    for (const item of Composer.library) {
        addBlock(normalizeManualBlock(item));
    }

}

function normalizeManualBlock(item) {

    return {
        id: item.id || item.block,
        block: item.block || item.id,
        opcode: item.block || item.id,
        category: getCategoryFromOpcode(item.block || item.id),
        pattern: item.pattern || "",
        preview: item.preview || "",
        params: item.params || [],
        color: item.color || null,
        shape: item.shape || null,
        source: "manual"
    };

}

function addRegistryBlocks(workspace, registry) {

    if (!registry) {
        return;
    }

    const opcodes = Object.keys(registry);

    for (const opcode of opcodes) {

        if (db.byOpcode[opcode]) {
            continue;
        }

        const block = createBlockEntryFromRegistry(
            workspace,
            opcode,
            registry[opcode]
        );

        if (block) {
            addBlock(block);
        }

    }

}

function createBlockEntryFromRegistry(workspace, opcode, definition) {

    const fallback = FALLBACK_PATTERNS[opcode];

    let json = null;

    try {

        definition.init.call({

            jsonInit(data) {

                json = data;

            }

        });

    } catch (e) {}

    const parsed = json
        ? buildPatternFromJson(json)
        : null;

    const pattern =
        (fallback && fallback.pattern) ||
        (parsed && parsed.pattern) ||
        patternFromOpcode(opcode);

    const preview =
        (fallback && fallback.preview) ||
        (parsed && parsed.preview) ||
        pattern.replace(/\[\]/g, "()");

    const params =
        (fallback && fallback.params) ||
        (parsed && parsed.params) ||
        [];

    return {

        id: opcode,
        block: opcode,
        opcode,

        category:
            getCategoryFromOpcode(opcode),

        pattern,
        preview,
        params,

        color: null,
        shape: null,

        previous: false,
        next: false,
        output: false,

        source: "registry"

    };

}

function createTemporaryBlock(workspace, opcode) {

    if (!workspace || typeof workspace.newBlock !== "function") {
        return null;
    }

    const Events = window.Blockly && Blockly.Events;

    if (Events && typeof Events.disable === "function") {
        Events.disable();
    }

    try {
        return workspace.newBlock(opcode);
    } finally {
        if (Events && typeof Events.enable === "function") {
            Events.enable();
        }
    }

}
function disposeTemporaryBlock(block) {

    if (!block) return;

    try {
        block.dispose(false);
    } catch (e) {}

}

function readBlockInstance(block) {

    const data = {};

    data.color = block.getColour
        ? block.getColour()
        : block.colour_;

    data.previous = !!block.previousConnection;
    data.next = !!block.nextConnection;
    data.output = !!block.outputConnection;

    data.shape = getShape(block);

    const parsed = buildPattern(block);

    data.pattern = parsed.pattern;
    data.params = parsed.params;

    return data;

}

/*=========================================
    PROCEDURES
=========================================*/

function addProcedureBlocks(map) {

    if (!map) return;

    if (map instanceof Map) {

        for (const procedure of map.values()) {

            addProcedure(procedure);

        }

        return;

    }

    for (const key in map) {

        addProcedure(map[key]);

    }

}

function addProcedure(proc) {

    if (!proc) return;

    let name = "";

    if (typeof proc.getName === "function") {

        name = proc.getName();

    } else {

        name = proc.name || "";

    }

    if (!name) return;

    const pattern = name;

    addBlock({

        id: "procedure_" + name,

        opcode: "procedures_call",

        block: "procedures_call",

        category: "myblocks",

        pattern,

        preview: pattern,

        params: [],

        shape: "stack",

        source: "procedure"

    });

}

/*=========================================
    DATABASE
=========================================*/

function addBlock(block) {

    if (!block) return;

    if (!block.pattern) return;

    const opcode = block.opcode;

    if (db.byOpcode[opcode]) return;

    db.all.push(block);

    db.byOpcode[opcode] = block;

    db.byPattern[
        normalize(block.pattern)
    ] = block;

}

function buildIndexes() {

    for (const block of db.all) {

        const category =
            block.category || "unknown";

        if (!db.byCategory[category]) {

            db.byCategory[category] = [];

        }

        db.byCategory[category].push(block);

        buildPrefixes(block);

    }

}

function buildPrefixes(block) {

    const words = normalize(block.pattern).split(" ");

    let prefix = "";

    for (const word of words) {

        prefix =
            prefix
            ? prefix + " " + word
            : word;

        if (!db.byPrefix[prefix]) {

            db.byPrefix[prefix] = [];

        }

        db.byPrefix[prefix].push(block);

    }

}

/*=========================================
    CACHE
=========================================*/

function saveToCache() {

    try {

        sessionStorage.setItem(

            CACHE_KEY,

            JSON.stringify({

                version: CACHE_VERSION,

                signature: db.signature,

                blocks: db.all

            })

        );

    } catch (e) {}

}

function loadFromCache(signature) {

    try {

        const raw =
            sessionStorage.getItem(CACHE_KEY);

        if (!raw) return false;

        const cache = JSON.parse(raw);

        if (
            cache.version !== CACHE_VERSION
        ) {
            return false;
        }

        if (
            cache.signature !== signature
        ) {
            return false;
        }

        clear();

        for (const block of cache.blocks) {

            addBlock(block);

        }

        buildIndexes();

        db.ready = true;

        db.signature = signature;

        return true;

    } catch (e) {

        return false;

    }

}

/*=========================================
    HELPERS
=========================================*/

function getWorkspace() {

    if (
        window.Blockly &&
        Blockly.getMainWorkspace
    ) {

        return Blockly.getMainWorkspace();

    }

    return null;

}

function getRegistry(workspace) {

    if (!workspace) return null;

    if (typeof workspace.getScratchBlocksBlocks === "function") {
        const blocks = workspace.getScratchBlocksBlocks();

        if (blocks && Object.keys(blocks).length) {
            return blocks;
        }
    }

    if (typeof workspace.getScratchBlocks === "function") {
        const scratchBlocks = workspace.getScratchBlocks();

        if (
            scratchBlocks &&
            scratchBlocks.Blocks &&
            Object.keys(scratchBlocks.Blocks).length
        ) {
            return scratchBlocks.Blocks;
        }
    }

    const factory = workspace.blockFactory_;

    if (factory) {
        const map = factory.blockMap || factory.blockMap_;

        if (map && Object.keys(map).length) {
            return map;
        }
    }

    if (
        workspace.resizeHandlerWrapper_ &&
        workspace.resizeHandlerWrapper_[0] &&
        workspace.resizeHandlerWrapper_[0][0] &&
        workspace.resizeHandlerWrapper_[0][0].Blockly &&
        workspace.resizeHandlerWrapper_[0][0].Blockly.Blocks
    ) {
        return workspace.resizeHandlerWrapper_[0][0].Blockly.Blocks;
    }

    if (
        workspace.toolbox_ &&
        workspace.toolbox_.flyout_ &&
        workspace.toolbox_.flyout_.workspace_ &&
        workspace.toolbox_.flyout_.workspace_.blockDB_
    ) {
        return workspace.toolbox_.flyout_.workspace_.blockDB_;
    }

    return null;

}
function getProcedures(workspace) {

    if (!workspace) return null;

    if (workspace.getProcedureMap) {

        return workspace.getProcedureMap();

    }

    return workspace.procedureMap_;

}

function getSignature(
    registry,
    procedures
) {

    const blocks =
        registry
        ? Object.keys(registry)
        : [];

    const procs = [];

    if (procedures) {

        if (procedures instanceof Map) {

            for (const p of procedures.values()) {

                procs.push(
                    p.getName()
                );

            }

        } else {

            procs.push(
                ...Object.keys(procedures)
            );

        }

    }

    return blocks
        .concat(procs)
        .sort()
        .join("|");

}

function buildPattern(block) {

    const params = [];

    let text = "";

    try {

        text = block.toString();

    } catch (e) {

        text = block.type;

    }

    if (
        Array.isArray(block.inputList)
    ) {

        for (const input of block.inputList) {

            if (
                !input.connection
            ) continue;

            params.push({

                name:
                    input.name,

                type:
                    detectParamType(input)

            });

            text += " []";

        }

    }

    return {

        pattern:
            normalizeSpaces(text),

        params

    };

}
function buildPatternFromJson(json) {

    const params = [];

    const previewParams = [];

    let pattern = "";

    let index = 1;

    while (json["message" + (index - 1)] !== undefined) {

        const message =
            String(json["message" + (index - 1)] || "");

        const args =
            json["args" + (index - 1)] || [];

        pattern += message;

        for (let i = 0; i < args.length; i++) {

            const arg = args[i];

            const placeholder = "%" + (i + 1);

            let replacement = "[]";

            switch (arg.type) {

                case "field_dropdown":

                    replacement = "[]";

                    params.push({
                        name: arg.name || "",
                        type: "menu"
                    });

                    previewParams.push("()");

                    break;

                case "field_variable":

                    replacement = "[]";

                    params.push({
                        name: arg.name || "",
                        type: "variable"
                    });

                    previewParams.push("()");

                    break;

                case "input_statement":

                    replacement = "{}";

                    params.push({
                        name: arg.name || "",
                        type: "stack"
                    });

                    previewParams.push("{}");

                    break;

                case "input_value":

                    replacement = "[]";

                    params.push({
                        name: arg.name || "",
                        type: "reporter"
                    });

                    previewParams.push("()");

                    break;

                default:

                    replacement = "[]";

                    params.push({
                        name: arg.name || "",
                        type: arg.type || "unknown"
                    });

                    previewParams.push("()");

                    break;

            }

            pattern = pattern.replace(
                placeholder,
                replacement
            );

        }

        pattern += " ";

        index++;

    }

    pattern = normalizeSpaces(pattern);

    return {

        pattern,

        preview: pattern
            .replace(/\[\]/g, "()")
            .replace(/\{\}/g, "{}"),

        params

    };

}
function detectParamType(input) {

    const check =
        input.connection &&
        input.connection.getCheck
            ? input.connection.getCheck()
            : null;

    const t = String(
        check || ""
    ).toLowerCase();

    if (
        t.includes("boolean")
    ) return "boolean";

    if (
        t.includes("number")
    ) return "number";

    if (
        t.includes("colour") ||
        t.includes("color")
    ) return "color";

    return "reporter";

}

function getShape(block) {

    if (
        Composer.Shapes &&
        Composer.Shapes.getBlockShape
    ) {

        return Composer.Shapes.getBlockShape(block);

    }

    return "stack";

}

function getCategoryFromOpcode(opcode) {

    return String(opcode)
        .split("_")[0];

}

function patternFromOpcode(opcode) {

    return String(opcode)
        .replace(/_/g, " ");

}

function normalize(text) {

    return String(text || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

}

function normalizeSpaces(text) {

    return String(text || "")
        .replace(/\s+/g, " ")
        .trim();

}

function scoreBlock(query, block) {

    const p =
        normalize(block.pattern);

    if (p === query)
        return 1000;

    if (p.startsWith(query))
        return 800;

    if (p.includes(query))
        return 500;

    return 0;

}

/*=========================================
    START
=========================================*/

setTimeout(() => {

    db.rebuild(false);

}, 1000);

})();
