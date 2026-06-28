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

    const components = [];

    buildComponents(
        block,
        components
    );

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
            case "menu":
            case "reporter":

                width += socketWidth(
                    c.value
                );

            break;

            case "boolean":

                width += 44;

            break;

        }

        width += 4;

    }

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

                px += drawReporterSocket(

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "string":

                px += drawStringSocket(

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "menu":

                px += drawMenuSocket(

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "reporter":

                px += drawReporterSocket(

                    c.value,

                    px,

                    y + 7

                );

            break;

            case "boolean":

                px += drawBooleanSocket(

                    c.value,

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
function socketWidth(value){

    ctx.font = "11px Segoe UI";

    const w = Math.max(

        24,

        ctx.measureText(value).width + 18

    );

    ctx.font = "bold 15px Segoe UI";

    return w;

}

function drawReporterSocket(value,x,y){

    const w = socketWidth(value);

    const h = 20;

    Composer.paths.draw(

        ctx,

        "reporter",

        x,

        y,

        w,

        h,

        "#FFFFFF",

        "#C8C8C8"

    );

    ctx.fillStyle = "#666";

    ctx.font = "11px Segoe UI";

    ctx.textAlign = "center";

    ctx.fillText(

        value,

        x + w/2,

        y + h/2

    );

    ctx.textAlign = "left";

    ctx.font = "bold 15px Segoe UI";

    return w;

}

function drawStringSocket(value,x,y){

    return drawReporterSocket(

        value,

        x,

        y

    );

}
function drawMenuSocket(value,x,y){

    const w = socketWidth(value) + 12;

    const h = 20;

    Composer.paths.draw(

        ctx,

        "reporter",

        x,

        y,

        w,

        h,

        "#FFFFFF",

        "#C8C8C8"

    );

    ctx.fillStyle = "#666";

    ctx.font = "11px Segoe UI";

    ctx.textAlign = "center";

    ctx.fillText(

        value + " ▼",

        x + w/2,

        y + h/2

    );

    ctx.textAlign = "left";

    ctx.font = "bold 15px Segoe UI";

    return w;

}
function drawBooleanSocket(value,x,y){

    const w = Math.max(

        42,

        socketWidth(value)

    );

    const h = 20;

    Composer.paths.draw(

        ctx,

        "boolean",

        x,

        y,

        w,

        h,

        "#FFFFFF",

        "#C8C8C8"

    );

    ctx.fillStyle = "#666";

    ctx.font = "11px Segoe UI";

    ctx.textAlign = "center";

    ctx.fillText(

        value,

        x + w/2,

        y + h/2

    );

    ctx.textAlign = "left";

    ctx.font = "bold 15px Segoe UI";

    return w;

}

})();
