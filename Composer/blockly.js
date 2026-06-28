
// blockly.js

(function () {

    Composer.blockly = {};

    function getWorkspace() {

        if (typeof Blockly === "undefined")
            return null;

        return Blockly.getMainWorkspace();

    }

    Composer.blockly.workspace = getWorkspace;

    Composer.blockly.create = function (type) {

        const ws = getWorkspace();

        if (!ws) {

            console.error("Blockly workspace not found.");

            return null;

        }

        const block = ws.newBlock(type);

        block.initSvg();

        block.render();

        return block;

    };

})();
