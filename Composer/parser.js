// parser.js
(function () {

    const parser = Composer.parser;

    parser.parse = function (text) {

        const ast = [];

        const lines = String(text || "")
            .split("\n")
            .map(x => x.trim())
            .filter(x => x.length);

        for (const line of lines) {

            const node = parseLine(line);

            if (node) {
                ast.push(node);
            }

        }

        return ast;

    };

    parser.parseBlock = function (text) {

        return parseLine(String(text || "").trim());

    };

    function parseLine(line) {

        const node = parseLibraryBlock(line);

        if (node) {
            return node;
        }

        return {
            type: "unknown",
            text: line
        };

    }

   function parseLibraryBlock(text) {

    text = normalizeSpace(text);

    if (!text.length) {
        return null;
    }

    const commands =
        Composer.blocks &&
        typeof Composer.blocks.getAll === "function"
            ? Composer.blocks.getAll()
            : Composer.library || [];

    if (!Array.isArray(commands)) {
        return null;
    }

    const sorted = commands
        .slice()
        .sort((a, b) => {

            const aSlots = countSlots(a.pattern);
            const bSlots = countSlots(b.pattern);

            if (b.pattern.length !== a.pattern.length) {
                return b.pattern.length - a.pattern.length;
            }

            return bSlots - aSlots;

        });

    for (const cmd of sorted) {

        const match = matchCommand(text, cmd);

        if (match) {
            return createBlockNode(cmd, match);
        }

    }

    return null;

}

    function getSortedLibrary() {

        return Composer.library
            .slice()
            .sort((a, b) => {

                const aSlots = countSlots(a.pattern);
                const bSlots = countSlots(b.pattern);

                if (b.pattern.length !== a.pattern.length) {
                    return b.pattern.length - a.pattern.length;
                }

                return bSlots - aSlots;

            });

    }

    function countSlots(pattern) {

        const matches = String(pattern || "").match(/\[\]/g);

        return matches ? matches.length : 0;

    }

   function createBlockNode(cmd, values) {

    return {
        type: "block",
        id: cmd.id || cmd.opcode || cmd.block,
        block: cmd.block || cmd.opcode || cmd.id,
        opcode: cmd.opcode || cmd.block || cmd.id,
        pattern: cmd.pattern,
        preview: cmd.preview,
        params: values.map((value, index) => {
            const paramInfo = cmd.params && cmd.params[index]
                ? cmd.params[index]
                : {};

            return parseParam(value, paramInfo);
        })
    };

}

    function parseParam(value, paramInfo) {

        const text = normalizeSpace(value);

        if (!text.length) {
            return {
                type: "value",
                value: "",
                paramType: paramInfo.type || "string"
            };
        }

        const nested = parseLibraryBlock(text);

        if (nested) {
            nested.paramType = paramInfo.type || null;
            return nested;
        }

        return {
            type: "value",
            value: text,
            paramType: paramInfo.type || "string"
        };

    }

    function matchCommand(text, cmd) {

        const patternParts = splitPattern(cmd.pattern);
        const textParts = tokenizeText(text);

        if (!textParts) {
            return null;
        }

        const result = matchParts(patternParts, textParts);

        return result;

    }

    function splitPattern(pattern) {

        const parts = [];
        const source = String(pattern || "");
        const re = /\[\]/g;

        let index = 0;
        let match;

        while ((match = re.exec(source))) {

            const before = source.slice(index, match.index);

            if (before.length) {
                pushTextPart(parts, before);
            }

            parts.push({
                type: "slot"
            });

            index = match.index + 2;

        }

        const after = source.slice(index);

        if (after.length) {
            pushTextPart(parts, after);
        }

        return parts;

    }

    function pushTextPart(parts, text) {

        const normalized = normalizeSpace(text);

        if (!normalized.length) {
            return;
        }

        parts.push({
            type: "text",
            value: normalized
        });

    }
        function tokenizeText(text) {

        const tokens = [];

        let buffer = "";

        for (let i = 0; i < text.length; i++) {

            const ch = text[i];

            if (ch === "[") {

                if (buffer.trim().length) {

                    pushTextToken(tokens, buffer);

                }

                buffer = "";

                const end = findClosingBracket(text, i);

                if (end === -1) {
                    return null;
                }

                tokens.push({
                    type: "slot",
                    value: text.slice(i + 1, end)
                });

                i = end;

                continue;

            }

            buffer += ch;

        }

        if (buffer.trim().length) {

            pushTextToken(tokens, buffer);

        }

        return tokens;

    }

    function pushTextToken(tokens, text) {

        const normalized = normalizeSpace(text);

        if (!normalized.length) {
            return;
        }

        tokens.push({
            type: "text",
            value: normalized
        });

    }

    function matchParts(patternParts, textParts) {

        if (patternParts.length !== textParts.length) {
            return null;
        }

        const values = [];

        for (let i = 0; i < patternParts.length; i++) {

            const pattern = patternParts[i];
            const text = textParts[i];

            if (pattern.type !== text.type) {
                return null;
            }

            if (pattern.type === "text") {

                if (
                    normalizeCompare(pattern.value) !==
                    normalizeCompare(text.value)
                ) {
                    return null;
                }

            }
            else {

                values.push(text.value);

            }

        }

        return values;

    }

    function findClosingBracket(text, start) {

        let depth = 0;

        for (let i = start; i < text.length; i++) {

            if (text[i] === "[") {
                depth++;
            }

            if (text[i] === "]") {

                depth--;

                if (depth === 0) {
                    return i;
                }

            }

        }

        return -1;

    }

    function normalizeSpace(text) {

        return String(text || "")
            .replace(/\s+/g, " ")
            .trim();

    }

    function normalizeCompare(text) {

        return normalizeSpace(text)
            .toLowerCase()
            .replace(/:\s+/g, ": ");

    }

    /*=========================================
        DEBUG
    =========================================*/

    parser.print = function (text) {

        const ast = parser.parseBlock(text);

        console.log(ast);

        return ast;

    };

})();
