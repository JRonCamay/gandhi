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

    function parseLine(line) {

        let m;

        m = line.match(/^move\s+(-?\d+(\.\d+)?)$/i);

        if (m) {

            return {

                type: "move",

                args: [Number(m[1])]

            };

        }

        m = line.match(/^wait\s+(-?\d+(\.\d+)?)$/i);

        if (m) {

            return {

                type: "wait",

                args: [Number(m[1])]

            };

        }

        m = line.match(/^turn\s+(-?\d+(\.\d+)?)$/i);

        if (m) {

            return {

                type: "turn",

                args: [Number(m[1])]

            };

        }

        m = line.match(/^say\s+(.+)$/i);

        if (m) {

            return {

                type: "say",

                args: [m[1]]

            };

        }

        m = line.match(/^hide$/i);

        if (m) {

            return {

                type: "hide",

                args: []

            };

        }

        m = line.match(/^show$/i);

        if (m) {

            return {

                type: "show",

                args: []

            };

        }

        return {

            type: "unknown",

            text: line

        };

    };

})();
