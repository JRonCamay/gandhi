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

    const components = [];

    buildComponents(
        block,
        components
    );

    const width = measureWidth(
        components
    );

    const x = 12;
    const y = 16;
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

            case "menu":

                px += Composer.sockets.menu(

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

function buildComponents(block,out){

    const parts = block.preview.split("()");

    for(let i=0;i<parts.length;i++){

        if(parts[i].length){

            out.push({

                type:"text",

                value:parts[i]

            });

        }

        if(i < block.params.length){

            out.push({

                type:block.params[i].type,

                value:block.params[i].name

            });

        }

    }

}
function measureWidth(components){

    ctx.font = "bold 15px Segoe UI";

    let width = 24;

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

                ctx.save();

                ctx.font = "11px Segoe UI";

                width += Math.max(
                    24,
                    ctx.measureText(c.value).width + 18
                );

                ctx.restore();

            break;

            case "menu":

                ctx.save();

                ctx.font = "11px Segoe UI";

                width += Math.max(
                    24,
                    ctx.measureText(c.value).width + 30
                );

                ctx.restore();

            break;

            case "boolean":

                ctx.save();

                ctx.font = "11px Segoe UI";

                width += Math.max(
                    42,
                    ctx.measureText(c.value).width + 18
                );

                ctx.restore();

            break;

            case "color":

                width += 22;

            break;

        }

        width += 4;

    }

    return width + 20;

}

})();
