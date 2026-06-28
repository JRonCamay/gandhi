// generator.js

(function () {

    function workspace() {
        return (window.Blockly || window.ScratchBlocks).getMainWorkspace();
    }

    function createBlock(type, x = 200, y = 150) {

        const ws = workspace();

        if (!ws) {
            console.error("Workspace not found");
            return null;
        }

        const block = ws.newBlock(type);

        block.initSvg();
        block.render();

        block.moveBy(x, y);

        return block;
    }

    Composer.generator.generate = function (text) {

        const lines = text
            .split("\n")
            .map(l => l.trim())
            .filter(Boolean);

        let x = 200;
        let y = 120;

        for (const line of lines) {

            const cmd = line.toLowerCase();

            let block = null;

            if (cmd.startsWith("move")) {
                block = createBlock("motion_movesteps", x, y);
            }

            else if (cmd.startsWith("wait")) {
                block = createBlock("control_wait", x, y);
            }

            else if (cmd.startsWith("say")) {
                block = createBlock("looks_say", x, y);
            }

            else if (cmd.startsWith("turn")) {
                block = createBlock("motion_turnright", x, y);
            }

            else if (cmd === "hide") {
                block = createBlock("looks_hide", x, y);
            }

            else if (cmd === "show") {
                block = createBlock("looks_show", x, y);
            }

            if (block) {
                y += 80;
            }

        }

    };

})();
