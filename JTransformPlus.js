(function (Scratch) {
    "use strict";

    if (!Scratch.extensions.unsandboxed) {
        throw new Error(
            "Transform Extension requires Unsandboxed Mode"
        );
    }

    class TransformExtension {

        getInfo() {
            return {
                id: "transform",
                name: "Transform",

                color1: "#9966FF",
                color2: "#8A55E6",

                blocks: [

                    {
                        opcode: "flipHorizontal",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "flip sprite horizontally"
                    },

                    {
                        opcode: "flipVertical",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "flip sprite vertically"
                    },

                    {
                        opcode: "rotateBy",
                        blockType: Scratch.BlockType.COMMAND,
                        text: "rotate sprite by [ANGLE] degrees",
                        arguments: {
                            ANGLE: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 15
                            }
                        }
                    },

                    "---",

                    {
                        opcode: "getDirection",
                        blockType: Scratch.BlockType.REPORTER,
                        text: "sprite direction"
                    }
                ]
            };
        }

        getDrawable(util) {

            const target =
                util.target;

            if (!target) {
                console.warn(
                    "[Transform] No target"
                );
                return null;
            }

            const renderer =
                Scratch.vm?.runtime?.renderer;

            if (!renderer) {
                console.warn(
                    "[Transform] Renderer not found"
                );
                return null;
            }

            return renderer
                ._allDrawables[
                    target.drawableID
                ];
        }

        flipHorizontal(args, util) {

            try {

                const target =
                    util.target;

                target.setDirection(
                    180 -
                    target.direction
                );

            } catch (err) {

                console.error(
                    "[Transform] flipHorizontal",
                    err
                );
            }
        }

        flipVertical(args, util) {

            try {

                const drawable =
                    this.getDrawable(
                        util
                    );

                if (!drawable) return;

                drawable.updateScale([
                    drawable.scale[0],
                    -drawable.scale[1]
                ]);

            } catch (err) {

                console.error(
                    "[Transform] flipVertical",
                    err
                );
            }
        }

        rotateBy(args, util) {

            try {

                const target =
                    util.target;

                target.setDirection(
                    target.direction +
                    Number(
                        args.ANGLE
                    )
                );

            } catch (err) {

                console.error(
                    "[Transform] rotateBy",
                    err
                );
            }
        }

        getDirection(args, util) {

            return (
                util.target
                    ?.direction ?? 0
            );
        }
    }

    Scratch.extensions.register(
        new TransformExtension()
    );

})(Scratch);
