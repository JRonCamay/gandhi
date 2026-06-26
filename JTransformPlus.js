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
                    opcode: "setWidth",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "set sprite width to [WIDTH]",
                    arguments: {
                        WIDTH: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },

                {
                    opcode: "setHeight",
                    blockType: Scratch.BlockType.COMMAND,
                    text: "set sprite height to [HEIGHT]",
                    arguments: {
                        HEIGHT: {
                            type: Scratch.ArgumentType.NUMBER,
                            defaultValue: 100
                        }
                    }
                },

                "---",

                {
                    opcode: "getWidth",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "sprite width"
                },

                {
                    opcode: "getHeight",
                    blockType: Scratch.BlockType.REPORTER,
                    text: "sprite height"
                }
            ]
        };
    }

    getDrawable(util) {

        const target =
            util.target;

        return Scratch.vm.runtime
            .renderer
            ._allDrawables[
                target.drawableID
            ];
    }

    flipHorizontal(args, util) {

        const target =
            util.target;

        target.setDirection(
            180 - target.direction
        );
    }

    flipVertical(args, util) {

        const drawable =
            this.getDrawable(
                util
            );

        drawable.updateScale([
            drawable.scale[0],
            -drawable.scale[1]
        ]);
    }

    rotateBy(args, util) {

        const target =
            util.target;

        target.setDirection(
            target.direction +
            Number(args.ANGLE)
        );
    }

    setWidth(args, util) {

        const drawable =
            this.getDrawable(
                util
            );

        drawable.updateScale([
            Number(args.WIDTH),
            drawable.scale[1]
        ]);
    }

    setHeight(args, util) {

        const drawable =
            this.getDrawable(
                util
            );

        drawable.updateScale([
            drawable.scale[0],
            Number(args.HEIGHT)
        ]);
    }

    getWidth(args, util) {

        const drawable =
            this.getDrawable(
                util
            );

        return drawable.scale[0];
    }

    getHeight(args, util) {

        const drawable =
            this.getDrawable(
                util
            );

        return drawable.scale[1];
    }
}

Scratch.extensions.register(
    new TransformExtension()
);