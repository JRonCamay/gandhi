// renderer.js
(function(){

const Renderer = {};

Composer.renderer = Renderer;

let canvas;
let ctx;

Renderer.init = function(container){

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

Renderer.clear = function(){

    if(!ctx) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

};

Renderer.preview = function(block){

    if(!block){

        Renderer.clear();
        return;

    }

    Renderer.draw(block);

};

Renderer.draw = function(block){

    Renderer.clear();

    ctx.font = "bold 15px Segoe UI";

    const components = buildComponents(block);

    const width = measureBlock(
        components
    );

    const x = 12;
    const y = 18;
    const h = 34;

    Composer.paths.draw(

        ctx,

        "stack",

        x,

        y,

        width,

        h,

        "#4C97FF",

        "#3373CC"

    );

    let px = x + 12;
        for(const c of components){

        switch(c.type){

            case "text":

                ctx.fillStyle = "white";
                ctx.font = "bold 15px Segoe UI";

                ctx.fillText(

                    c.value,

                    px,

                    y + h / 2

                );

                px += ctx.measureText(
                    c.value
                ).width;

            break;

            case "number":

                px += Composer.sockets.number(

                    ctx,

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "string":

                px += Composer.sockets.string(

                    ctx,

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "reporter":

                px += Composer.sockets.reporter(

                    ctx,

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "menu":

                px += Composer.sockets.menu(

                    ctx,

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "boolean":

                px += Composer.sockets.boolean(

                    ctx,

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "color":

                px += Composer.sockets.color(

                    ctx,

                    px,

                    y + 7

                );

            break;

        }

        px += 4;

    }

};

function buildComponents(block){

    const components = [];

    const parts = block.preview.split("()");

    for(let i=0;i<parts.length;i++){

        if(parts[i].length){

            components.push({

                type:"text",

                value:parts[i]

            });

        }

        if(i < block.params.length){

            components.push({

                type:block.params[i].type,

                value:block.params[i].name

            });

        }

    }

    return components;

}
function measureBlock(components){

    let width = 24;

    ctx.font = "bold 15px Segoe UI";

    for(const c of components){

        switch(c.type){

            case "text":

                width += ctx.measureText(
                    c.value
                ).width;

            break;

            case "number":

            case "string":

            case "reporter":

            case "menu":

            case "boolean":

            case "color":

                width += Composer.sockets.measure(

                    ctx,

                    c.type,

                    c.value || ""

                );

            break;

        }

        width += 4;

    }

    return width + 20;

}

function drawComponent(component,x,y){

    switch(component.type){

        case "text":

            ctx.fillStyle = "white";

            ctx.font = "bold 15px Segoe UI";

            ctx.fillText(

                component.value,

                x,

                y

            );

            return ctx.measureText(
                component.value
            ).width;

        case "number":

            return Composer.sockets.number(
                ctx,
                component.value,
                x,
                y-10
            );

        case "string":

            return Composer.sockets.string(
                ctx,
                component.value,
                x,
                y-10
            );

        case "reporter":

            return Composer.sockets.reporter(
                ctx,
                component.value,
                x,
                y-10
            );

        case "menu":

            return Composer.sockets.menu(
                ctx,
                component.value,
                x,
                y-10
            );

        case "boolean":

            return Composer.sockets.boolean(
                ctx,
                component.value,
                x,
                y-10
            );

        case "color":

            return Composer.sockets.color(
                ctx,
                x,
                y-10
            );

    }

    return 0;

}
    // End of Renderer.draw()
    // (This function is already closed in Part 2)

})();
