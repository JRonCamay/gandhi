/*
BlokSearch/canvas-injector.js
Magnetic Teleportation insertion helper for Blockly/Gandi workspaces.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.CanvasInjector = class CanvasInjector {
    constructor(options = {}) {
        this.persistence = options.persistence || window.BlokSearch.persistenceManager || null;
        this.pendingFrame = 0;
    }

    resolveBlockly() {
        if (window.Blockly) return window.Blockly;
        if (window.BlokSearch?.blocklyAdapter?.getBlockly) {
            return window.BlokSearch.blocklyAdapter.getBlockly();
        }
        return null;
    }

    resolveWorkspace() {
        const Blockly = this.resolveBlockly();
        if (!Blockly || !Blockly.getMainWorkspace) return null;
        return Blockly.getMainWorkspace();
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

    resolveActiveStack(workspace) {
        if (!workspace) return null;

        const selected = window.Blockly?.selected || workspace.getSelected?.();
        if (selected && selected.workspace === workspace) {
            return this.getBottomBlock(selected);
        }

        const blocks = workspace.getAllBlocks ? workspace.getAllBlocks(false) : [];
        if (!blocks.length) return null;

        let best = null;
        let bestY = -Infinity;

        for (let i = 0; i < blocks.length; i++) {
            const block = blocks[i];
            if (!block || block.getParent?.()) continue;

            const bottom = this.getBottomBlock(block);
            const xy = bottom.getRelativeToSurfaceXY ? bottom.getRelativeToSurfaceXY() : { x: 0, y: 0 };
            const height = this.getBlockHeight(bottom);
            const bottomY = xy.y + height;

            if (bottomY > bestY) {
                bestY = bottomY;
                best = bottom;
            }
        }

        return best;
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

    resolveInsertionPoint(workspace) {
        const stackBottom = this.resolveActiveStack(workspace);

        if (stackBottom && stackBottom.getRelativeToSurfaceXY) {
            const xy = stackBottom.getRelativeToSurfaceXY();
            return {
                x: xy.x,
                y: xy.y + this.getBlockHeight(stackBottom),
                stackBottom
            };
        }

        const metrics = workspace.getMetrics ? workspace.getMetrics() : null;
        return {
            x: metrics ? metrics.viewLeft + 40 : 40,
            y: metrics ? metrics.viewTop + 40 : 40,
            stackBottom: null
        };
    }

    createBlock(entry, workspace) {
        if (!entry || !entry.type || !workspace) return null;

        const block = workspace.newBlock(entry.type);
        if (!block) return null;

        block.initSvg?.();
        block.render?.();
        return block;
    }

    magneticSnap(block, point) {
        if (!block || !point) return;

        block.moveBy(point.x, point.y);

        if (point.stackBottom?.nextConnection && block.previousConnection) {
            try {
                point.stackBottom.nextConnection.connect(block.previousConnection);
            } catch (error) {
                // If connection fails, the moved position is still valid fallback behavior.
            }
        }

        block.select?.();
    }

    teleport(entry, context = {}) {
        if (this.pendingFrame) cancelAnimationFrame(this.pendingFrame);

        this.pendingFrame = requestAnimationFrame(() => {
            this.pendingFrame = 0;

            const workspace = context.workspace || this.resolveWorkspace();
            if (!workspace) return null;

            const point = this.resolveInsertionPoint(workspace);
            const block = this.createBlock(entry, workspace);
            if (!block) return null;

            this.magneticSnap(block, point);

            if (this.persistence) {
                this.persistence.record(entry);
            }

            return block;
        });

        return true;
    }
};

window.BlokSearch.canvasInjector =
    window.BlokSearch.canvasInjector ||
    new window.BlokSearch.CanvasInjector();