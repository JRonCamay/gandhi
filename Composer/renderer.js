// renderer.js
(function () {

const Renderer = {};

Composer.renderer = Renderer;

let canvas = null;
let ctx = null;

/*=========================================
    INIT
=========================================*/

Renderer.init = function (container) {

    canvas = document.createElement("canvas");

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;

    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

    container.innerHTML = "";
    container.appendChild(canvas);

    ctx = canvas.getContext("2d");

    ctx.textBaseline = "middle";

};

/*=========================================
    CLEAR
=========================================*/

Renderer.clear = function(){

    if(!ctx) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

};

/*=========================================
    PREVIEW
=========================================*/

Renderer.preview = function(block){

    if(!block){

        Renderer.clear();

        return;

    }

    Renderer.draw(block);

};

/*=========================================
    DRAW
=========================================*/

Renderer.draw = function(block){

    Renderer.clear();

    const components = buildComponents(block);

    const width = measureComponents(components);

    const blockX = 12;
    const blockY = 16;
    const blockH = 34;

    const blockStyle = getBlockStyle(block);
    const shape = getDrawableShape(
        getBlockShape(blockStyle)
    );
    const color = blockStyle.color;

    Composer.paths.draw(

        ctx,

        shape,

        blockX,

        blockY,

        width,

        blockH,

        color,

        getStrokeColor(color)

    );

    ctx.font = "bold 15px Segoe UI";

    let x = blockX + 12;

    for(const component of components){

        const used = drawComponent(

            component,

            x,

            blockY + blockH/2

        );

        x += used + 4;

    }

};

/*=========================================
    STYLE
=========================================*/

function getBlockStyle(block){

    if(
        Composer.BlockStyle &&
        typeof Composer.BlockStyle.getBlockStyle === "function" &&
        block.block
    ){
        return Composer.BlockStyle.getBlockStyle(block.block);
    }

    return {
        color:null,
        shape:null,
        previous:false,
        next:false,
        output:false,
        inputs:[]
    };

}

function getBlockShape(blockStyle){

    if(
        Composer.Shapes &&
        typeof Composer.Shapes.getBlockShape === "function"
    ){
        return Composer.Shapes.getBlockShape(blockStyle);
    }

    return blockStyle.shape || "stack";

}

function getDrawableShape(shape){

    if(Composer.paths && Composer.paths[shape]){
        return shape;
    }

    // TODO: Draw c-block and end-block shapes when Composer.paths supports them.
    return "stack";

}

function getStrokeColor(color){

    if(!color || typeof color !== "string"){
        return null;
    }

    const hex = color.replace("#", "");

    if(!/^([0-9a-f]{3}|[0-9a-f]{6})$/i.test(hex)){
        return null;
    }

    const fullHex = hex.length === 3
        ? hex.split("").map(x => x + x).join("")
        : hex;

    const channels = [
        fullHex.slice(0,2),
        fullHex.slice(2,4),
        fullHex.slice(4,6)
    ].map(value => Math.max(
        0,
        Math.round(parseInt(value, 16) * 0.82)
    ));

    return "#" + channels
        .map(value => value.toString(16).padStart(2,"0"))
        .join("");

}

/*=========================================
    BUILD COMPONENTS
=========================================*/

function buildComponents(block){

    const result = [];

    const parts = block.preview.split("()");

    for(let i=0;i<parts.length;i++){

        if(parts[i].length){

            result.push({

                type:"text",

                value:parts[i]

            });

        }

        if(i < block.params.length){

            result.push({

                type:block.params[i].type,

                value:block.params[i].name

            });

        }

    }

    return result;

}
/*=========================================
    MEASURE
=========================================*/

function measureComponents(components){

    ctx.font = "bold 15px Segoe UI";

    let width = 24;

    for(const component of components){

        switch(component.type){

            case "text":

                width += ctx.measureText(
                    component.value
                ).width;

            break;

            default:

                width += Composer.sockets.measure(

                    ctx,

                    component.type,

                    component.value || ""

                );

        }

        width += 4;

    }

    return width + 20;

}

/*=========================================
    DRAW COMPONENT
=========================================*/

function drawComponent(component,x,centerY){

    switch(component.type){

        case "text":

            ctx.fillStyle = "#FFFFFF";

            ctx.font = "bold 15px Segoe UI";

            ctx.fillText(

                component.value,

                x,

                centerY

            );

            return ctx.measureText(
                component.value
            ).width;

        case "number":

            return Composer.sockets.number(

                ctx,

                component.value,

                x,

                centerY-10

            );

        case "string":

            return Composer.sockets.string(

                ctx,

                component.value,

                x,

                centerY-10

            );

        case "reporter":

            return Composer.sockets.reporter(

                ctx,

                component.value,

                x,

                centerY-10

            );

        case "menu":

            return Composer.sockets.menu(

                ctx,

                component.value,

                x,

                centerY-10

            );

        case "boolean":

            return Composer.sockets.boolean(

                ctx,

                component.value,

                x,

                centerY-10

            );

        case "color":

            return Composer.sockets.color(

                ctx,

                x,

                centerY-10

            );

    }

    return 0;

}
/*=========================================
    INLINE BLOCK SUPPORT
=========================================*/

function drawInline(block,x,y){

    const components = buildComponents(block);

    let px = x;

    for(const component of components){

        px += drawComponent(

            component,

            px,

            y

        );

        px += 4;

    }

    return px - x;

}

function measureInline(block){

    const components = buildComponents(block);

    return measureComponents(components);

}

/*=========================================
    FUTURE API
=========================================*/

Renderer.measure = function(block){

    return measureInline(block);

};

Renderer.drawInline = function(

    block,

    x,

    y

){

    return drawInline(

        block,

        x,

        y

    );

};

/*=========================================
    DEBUG
=========================================*/

Renderer.debug = false;

Renderer.setDebug = function(value){

    Renderer.debug = value;

};
/*=========================================
    RESIZE
=========================================*/

Renderer.resize = function(){

    if(!canvas) return;

    const parent = canvas.parentElement;

    if(!parent) return;

    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    ctx.textBaseline = "middle";

};

window.addEventListener(
    "resize",
    Renderer.resize
);

/*=========================================
    READY
=========================================*/

Renderer.ready = function(){

    return !!ctx;

};

})();
