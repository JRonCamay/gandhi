/*
BlokSearch/canvas-injector.js
Magnetic Teleportation insertion helper for Blockly/Gandi workspaces.
*/
window.BlokSearch = window.BlokSearch || {};

window.BlokSearch.CanvasInjector = class CanvasInjector {
    constructor(options = {}) {
        this.persistence = options.persistence || window.BlokSearch.persistenceManager || null;
        this.pendingFrame = 0;
        this.injectWarpStyle();
    }

    injectWarpStyle() {
        if (document.getElementById("bloksearch-warp-style")) return;

        const style = document.createElement("style");
        style.id = "bloksearch-warp-style";
        style.textContent = `
            @keyframes bloksearch-warp-in {
                0% {
                    transform: scale(0.88);
                    filter: drop-shadow(0 0 0 rgba(76, 151, 255, 0));
                    opacity: 0.35;
                }
                55% {
                    transform: scale(1.06);
                    filter: drop-shadow(0 0 12px rgba(76, 151, 255, 0.9));
                    opacity: 1;
                }
                100% {
                    transform: scale(1);
                    filter: drop-shadow(0 0 0 rgba(76, 151, 255, 0));
                    opacity: 1;
                }
            }

            .bloksearch-warp-in {
                transform-box: fill-box;
                transform-origin: center;
                will-change: transform, filter, opacity;
                animation: bloksearch-warp-in 180ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
            }
        `;
        document.head.appendChild(style);
    }

    resolveContext(context = {}) {
        if (context.workspace) return context;

        if (window.BlokSearch?.contextResolver?.resolve) {
            return {
                ...window.BlokSearch.contextResolver.resolve(),
                ...context
            };
        }

        return context;
    }

    createBlock(entry, workspace) {
        if (!entry || !entry.type || !workspace) return null;

        const block = workspace.newBlock(entry.type);
        if (!block) return null;

        block.initSvg?.();
        block.render?.();
        return block;
    }

    moveBlockTo(block, x, y) {
        if (!block || !block.moveBy) return;

        const current = block.getRelativeToSurfaceXY
            ? block.getRelativeToSurfaceXY()
            : { x: 0, y: 0 };

        block.moveBy(x - current.x, y - current.y);
    }

    connectIfPossible(block, ctx) {
        if (!block || !ctx?.bottomBlock) return false;

        const nextConnection = ctx.bottomBlock.nextConnection;
        const previousConnection = block.previousConnection;

        if (!nextConnection || !previousConnection) return false;

        try {
            nextConnection.connect(previousConnection);
            return true;
        } catch (error) {
            return false;
        }
    }

    magneticSnap(block, ctx) {
        if (!block || !ctx) return;

        const connected = this.connectIfPossible(block, ctx);

        if (!connected) {
            this.moveBlockTo(block, ctx.insertX || 40, ctx.insertY || 40);
        }

        block.select?.();
        this.playWarpEffect(block);
    }

    playWarpEffect(block) {
        const firstRoot = block?.getSvgRoot ? block.getSvgRoot() : null;
        if (firstRoot?.classList) {
            firstRoot.classList.remove("bloksearch-warp-in");
        }

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                const svgRoot = block?.getSvgRoot ? block.getSvgRoot() : firstRoot;
                if (!svgRoot || !svgRoot.classList) return;

                svgRoot.classList.remove("bloksearch-warp-in");
                void svgRoot.getBoundingClientRect?.();
                svgRoot.classList.add("bloksearch-warp-in");

                window.setTimeout(() => {
                    if (svgRoot && svgRoot.classList) {
                        svgRoot.classList.remove("bloksearch-warp-in");
                    }
                }, 220);
            });
        });
    }

    teleport(entry, context = {}) {
        if (this.pendingFrame) cancelAnimationFrame(this.pendingFrame);

        this.pendingFrame = requestAnimationFrame(() => {
            this.pendingFrame = 0;

            const ctx = this.resolveContext(context);
            const workspace = ctx.workspace;
            if (!workspace) return null;

            const block = this.createBlock(entry, workspace);
            if (!block) return null;

            this.magneticSnap(block, ctx);

            if (this.persistence) {
                this.persistence.record({
                    ...entry,
                    category: entry.category || ctx.category || "",
                    socketType: ctx.socketType || "stack",
                    connectionType: ctx.connectionType || "NONE"
                });
            }

            return block;
        });

        return true;
    }
};

window.BlokSearch.canvasInjector =
    window.BlokSearch.canvasInjector ||
    new window.BlokSearch.CanvasInjector();