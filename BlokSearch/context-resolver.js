/*
BlokSearch/context-resolver.js
Single source of truth for current Blockly/Gandi IDE context.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.ContextResolver = class ContextResolver {
    resolveBlockly() {
        if (window.Blockly) return window.Blockly;
        if (window.BlokSearch?.blocklyAdapter?.getBlockly) {
            return window.BlokSearch.blocklyAdapter.getBlockly();
        }
        return null;
    }

    resolveWorkspace() {
        const Blockly = this.resolveBlockly();
        if (!Blockly) return null;

        if (Blockly.getMainWorkspace) {
            const workspace = Blockly.getMainWorkspace();
            if (workspace) return workspace;
        }

        if (Blockly.WorkspaceSvg?.instances?.length) {
            return Blockly.WorkspaceSvg.instances[0];
        }

        return null;
    }

    resolveSelectedBlock(workspace) {
        const Blockly = this.resolveBlockly();
        const selected = Blockly?.selected || workspace?.getSelected?.();

        if (selected && (!workspace || selected.workspace === workspace)) {
            return selected;
        }

        return null;
    }

    getTopBlock(block) {
        let current = block;
        const seen = new Set();

        while (current && !seen.has(current)) {
            seen.add(current);
            const parent = current.getParent ? current.getParent() : null;
            if (!parent) return current;
            current = parent;
        }

        return block;
    }

    getBottomBlock(block) {
        let current = block;
        const seen = new Set();

        while (current && !seen.has(current)) {
            seen.add(current);
            const next = current.getNextBlock ? current.getNextBlock() : null;
            if (!next) return current;
            current = next;
        }

        return block;
    }

    getBlockHeight(block) {
        if (!block) return 40;
        if (block.height) return block.height;

        if (block.getHeightWidth) {
            const size = block.getHeightWidth();
            if (size && size.height) return size.height;
        }

        const svgRoot = block.getSvgRoot ? block.getSvgRoot() : null;
        if (svgRoot && svgRoot.getBBox) {
            try {
                return svgRoot.getBBox().height || 40;
            } catch (error) {
                return 40;
            }
        }

        return 40;
    }

    getStackInfo(block) {
        if (!block) {
            return {
                topBlock: null,
                bottomBlock: null,
                stackLength: 0,
                stackHeight: 0
            };
        }

        const topBlock = this.getTopBlock(block);
        let current = topBlock;
        let stackLength = 0;
        let stackHeight = 0;
        const seen = new Set();

        while (current && !seen.has(current)) {
            seen.add(current);
            stackLength++;
            stackHeight += this.getBlockHeight(current);
            current = current.getNextBlock ? current.getNextBlock() : null;
        }

        return {
            topBlock,
            bottomBlock: this.getBottomBlock(topBlock),
            stackLength,
            stackHeight
        };
    }

    getMouseWorkspacePosition(workspace) {
        const x = Number.isFinite(window.mouseX) ? window.mouseX : 0;
        const y = Number.isFinite(window.mouseY) ? window.mouseY : 0;

        if (!workspace || !workspace.getMetrics) {
            return { x, y };
        }

        const metrics = workspace.getMetrics();
        const scale = workspace.scale || 1;

        return {
            x: metrics.viewLeft + (x / scale),
            y: metrics.viewTop + (y / scale)
        };
    }

    getActiveCategory(workspace) {
        const toolbox = workspace?.getToolbox?.();
        if (!toolbox) return "";

        const selected = toolbox.getSelectedItem?.() || toolbox.selectedItem_ || toolbox.selectedItem;
        const rawName = selected?.name_ || selected?.name || selected?.getName?.() || selected?.id_ || "";

        return String(rawName)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "")
            .trim();
    }

    getConnectionInfo(block) {
        if (!block) {
            return {
                connection: null,
                connectionType: "NONE",
                socketType: "stack",
                reporterMode: false,
                booleanMode: false
            };
        }

        if (block.outputConnection) {
            const check = block.outputConnection.check_ || [];
            const booleanMode = check.includes("Boolean");

            return {
                connection: block.outputConnection,
                connectionType: "OUTPUT",
                socketType: booleanMode ? "boolean" : "reporter",
                reporterMode: true,
                booleanMode
            };
        }

        if (block.nextConnection) {
            return {
                connection: block.nextConnection,
                connectionType: "NEXT",
                socketType: "stack",
                reporterMode: false,
                booleanMode: false
            };
        }

        return {
            connection: null,
            connectionType: "NONE",
            socketType: "stack",
            reporterMode: false,
            booleanMode: false
        };
    }

    getFallbackInsertionPoint(workspace, mousePoint) {
        const metrics = workspace?.getMetrics?.();

        return {
            x: metrics ? metrics.viewLeft + 40 : mousePoint.x || 40,
            y: metrics ? metrics.viewTop + 40 : mousePoint.y || 40
        };
    }

    getInsertionPoint(workspace, bottomBlock, mousePoint) {
        if (bottomBlock?.getRelativeToSurfaceXY) {
            const xy = bottomBlock.getRelativeToSurfaceXY();
            return {
                x: xy.x,
                y: xy.y + this.getBlockHeight(bottomBlock)
            };
        }

        return this.getFallbackInsertionPoint(workspace, mousePoint);
    }

    resolve() {
        const workspace = this.resolveWorkspace();
        const selectedBlock = this.resolveSelectedBlock(workspace);
        const stack = this.getStackInfo(selectedBlock);
        const mouse = this.getMouseWorkspacePosition(workspace);
        const insertion = this.getInsertionPoint(workspace, stack.bottomBlock, mouse);
        const connection = this.getConnectionInfo(stack.bottomBlock || selectedBlock);

        return {
            workspace,
            selectedBlock,
            topBlock: stack.topBlock,
            bottomBlock: stack.bottomBlock,
            stackLength: stack.stackLength,
            stackHeight: stack.stackHeight,
            connection: connection.connection,
            connectionType: connection.connectionType,
            socketType: connection.socketType,
            category: this.getActiveCategory(workspace),
            reporterMode: connection.reporterMode,
            booleanMode: connection.booleanMode,
            mouseWorkspaceX: mouse.x,
            mouseWorkspaceY: mouse.y,
            insertX: insertion.x,
            insertY: insertion.y
        };
    }
};

window.BlokSearch.contextResolver =
    window.BlokSearch.contextResolver ||
    new window.BlokSearch.ContextResolver();