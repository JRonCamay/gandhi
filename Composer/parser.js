// parser.js
(function () {

    const parser = Composer.parser;

    parser.parse = function (text) {

        const ast = [];

        const lines = text
            .split("\n")
            .map(x => x.trim())
            .filter(x => x.length);

        for (const line of lines) {

            const node = parseLine(line);

            if (node)
                ast.push(node);

        }

        return ast;

    };

    parser.parseBlock = function(text){

        return parseLine(String(text || "").trim());

    };

    function parseLine(line) {

        const libraryNode = parseLibraryBlock(line);

        if(libraryNode){
            return libraryNode;
        }

        return {
            type: "unknown",
            text: line
        };

    }

    function parseLibraryBlock(text){

        if(!Composer.library || !Array.isArray(Composer.library)){
            return null;
        }

        for(const cmd of Composer.library){

            const params = matchPattern(text, cmd.pattern);

            if(params){

                return {
                    type: "block",
                    id: cmd.id,
                    block: cmd.block,
                    pattern: cmd.pattern,
                    preview: cmd.preview,
                    params: params.map(value => parseParam(value))
                };

            }

        }

        return null;

    }

    function parseParam(value){

        const trimmed = String(value || "").trim();

        const nested = parseLibraryBlock(trimmed);

        if(nested){
            return nested;
        }

        return {
            type: "value",
            value: trimmed
        };

    }

    function matchPattern(text, pattern){

        const textParts = tokenizeText(text);
        const patternParts = splitPattern(pattern);

        return matchParts(textParts, patternParts);

    }

    function splitPattern(pattern){

        const parts = [];
        const re = /\[\]/g;

        let index = 0;
        let match;

        while((match = re.exec(pattern))){

            if(match.index > index){

                parts.push({
                    type: "text",
                    value: normalizeSpace(pattern.slice(index, match.index))
                });

            }

            parts.push({
                type: "slot"
            });

            index = match.index + 2;

        }

        if(index < pattern.length){

            parts.push({
                type: "text",
                value: normalizeSpace(pattern.slice(index))
            });

        }

        return parts.filter(part =>
            part.type === "slot" ||
            part.value.length
        );

    }

    function tokenizeText(text){

        const tokens = [];
        let buffer = "";

        for(let i = 0; i < text.length; i++){

            const char = text[i];

            if(char === "["){

                if(buffer.trim().length){

                    tokens.push({
                        type: "text",
                        value: normalizeSpace(buffer)
                    });

                }

                buffer = "";

                const end = findClosingBracket(text, i);

                if(end === -1){
                    return null;
                }

                tokens.push({
                    type: "slot",
                    value: text.slice(i + 1, end)
                });

                i = end;

                continue;

            }

            buffer += char;

        }

        if(buffer.trim().length){

            tokens.push({
                type: "text",
                value: normalizeSpace(buffer)
            });

        }

        return tokens;

    }

    function matchParts(textParts, patternParts){

        if(!textParts){
            return null;
        }

        if(textParts.length !== patternParts.length){
            return null;
        }

        const params = [];

        for(let i = 0; i < patternParts.length; i++){

            const patternPart = patternParts[i];
            const textPart = textParts[i];

            if(patternPart.type !== textPart.type){
                return null;
            }

            if(patternPart.type === "text"){

                if(
                    normalizeCompare(patternPart.value) !==
                    normalizeCompare(textPart.value)
                ){
                    return null;
                }

            }else{

                params.push(textPart.value);

            }

        }

        return params;

    }

    function findClosingBracket(text, start){

        let depth = 0;

        for(let i = start; i < text.length; i++){

            if(text[i] === "["){
                depth++;
            }

            if(text[i] === "]"){

                depth--;

                if(depth === 0){
                    return i;
                }

            }

        }

        return -1;

    }

    function normalizeSpace(text){

        return String(text || "")
            .replace(/\s+/g, " ")
            .trim();

    }

    function normalizeCompare(text){

        return normalizeSpace(text)
            .toLowerCase()
            .replace(/:\s+/g, ": ");

    }

})();
