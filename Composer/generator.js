Composer.generator.generate = function (text) {

    const ast = Composer.parser.parse(text);

    console.clear();

    console.log("===== AST =====");

    console.table(ast);

    Composer.ui.status(ast.length + " command(s)");

};
