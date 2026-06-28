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

    Composer.paths.draw(

        ctx,

        "stack",

        blockX,

        blockY,

        width,

        blockH,

        "#4C97FF",

        "#3373CC"

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
