(function () {

    Composer.generator.generate = function (text) {

        const ast = Composer.parser.parse(text);

        console.clear();

        console.table(ast);

        if (!ast.length)
            return;

        const first = ast[0];

        if (first.type === "move") {

            Composer.blockly.create("motion_movesteps");

        }

    };

})();
