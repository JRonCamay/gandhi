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

    const blockStyle = getBlockStyle(block);
    const shape = getBlockShape(blockStyle);
    const color = blockStyle.color || "#4C97FF";
    const strokeColor = getStrokeColor(color);

    const blockH = getBlockHeight(shape);

    drawBlockShape(
        ctx,
        shape,
        blockX,
        blockY,
        width,
        blockH,
        color,
        strokeColor
    );

    ctx.font = "bold 15px Segoe UI";

    let x = blockX + getTextLeftPadding(shape);

    for(const component of components){

        const used = drawComponent(
            component,
            x,
            blockY + 17
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

    if(blockStyle && blockStyle.shape){
        return blockStyle.shape;
    }

    if(
        Composer.Shapes &&
        typeof Composer.Shapes.getBlockShape === "function"
    ){
        return Composer.Shapes.getBlockShape(blockStyle);
    }

    return "stack";

}

/*=========================================
    SHAPE DRAWING
=========================================*/

function getBlockHeight(shape){

    switch(shape){

        case "hat":
            return 42;

        case "reporter":
        case "boolean":
            return 28;

        case "c-block":
        case "end-block":
            return 78;

        default:
            return 34;

    }

}

function getTextLeftPadding(shape){

    switch(shape){

        case "boolean":
            return 20;

        case "reporter":
            return 14;

        default:
            return 12;

    }

}

function drawBlockShape(ctx, shape, x, y, w, h, color, strokeColor){

    ctx.save();

    ctx.fillStyle = color;
    ctx.strokeStyle = strokeColor || color;
    ctx.lineWidth = 1;

    ctx.beginPath();

    switch(shape){

        case "hat":
            drawHatPath(ctx, x, y, w, h);
        break;

        case "cap":
            drawCapPath(ctx, x, y, w, h);
        break;

        case "reporter":
            drawReporterPath(ctx, x, y, w, h);
        break;

        case "boolean":
            drawBooleanPath(ctx, x, y, w, h);
        break;

        case "c-block":
            drawCBlockPath(ctx, x, y, w, h, false);
        break;

        case "end-block":
            drawCBlockPath(ctx, x, y, w, h, true);
        break;

        case "stack":
        default:
            drawStackPath(ctx, x, y, w, h);
        break;

    }

    ctx.fill();
    ctx.stroke();

    ctx.restore();

}

function drawStackPath(ctx, x, y, w, h){

    const r = 4;

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + 16, y);
    drawTopNotch(ctx, x + 16, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + 36, y + h);
    drawBottomBump(ctx, x + 16, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

}

function drawHatPath(ctx, x, y, w, h){

    const r = 4;
    const hatH = 10;

    ctx.moveTo(x + r, y + hatH);
    ctx.quadraticCurveTo(x + 16, y - 6, x + 44, y + hatH);
    ctx.lineTo(x + w - r, y + hatH);
    ctx.quadraticCurveTo(x + w, y + hatH, x + w, y + hatH + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + 36, y + h);
    drawBottomBump(ctx, x + 16, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + hatH + r);
    ctx.quadraticCurveTo(x, y + hatH, x + r, y + hatH);

}

function drawCapPath(ctx, x, y, w, h){

    const r = 4;

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + 16, y);
    drawTopNotch(ctx, x + 16, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

}

function drawReporterPath(ctx, x, y, w, h){

    const r = h / 2;

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

}

function drawBooleanPath(ctx, x, y, w, h){

    const point = 12;

    ctx.moveTo(x + point, y);
    ctx.lineTo(x + w - point, y);
    ctx.lineTo(x + w, y + h / 2);
    ctx.lineTo(x + w - point, y + h);
    ctx.lineTo(x + point, y + h);
    ctx.lineTo(x, y + h / 2);
    ctx.lineTo(x + point, y);

}

function drawCBlockPath(ctx, x, y, w, h, noBottomBump){

    const r = 4;
    const mouthTop = y + 34;
    const mouthBottom = y + h - 18;
    const innerX = x + 26;

    ctx.moveTo(x + r, y);
    ctx.lineTo(x + 16, y);
    drawTopNotch(ctx, x + 16, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, mouthTop - r);
    ctx.quadraticCurveTo(x + w, mouthTop, x + w - r, mouthTop);
    ctx.lineTo(innerX + 20, mouthTop);
    drawBottomBump(ctx, innerX, mouthTop);
    ctx.lineTo(innerX + r, mouthTop);
    ctx.quadraticCurveTo(innerX, mouthTop, innerX, mouthTop + r);
    ctx.lineTo(innerX, mouthBottom - r);
    ctx.quadraticCurveTo(innerX, mouthBottom, innerX + r, mouthBottom);
    ctx.lineTo(x + w - r, mouthBottom);
    ctx.quadraticCurveTo(x + w, mouthBottom, x + w, mouthBottom + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);

    if(!noBottomBump){
        ctx.lineTo(x + 36, y + h);
        drawBottomBump(ctx, x + 16, y + h);
    }

    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);

}

function drawTopNotch(ctx, x, y){

    ctx.lineTo(x + 5, y);
    ctx.lineTo(x + 9, y + 4);
    ctx.lineTo(x + 23, y + 4);
    ctx.lineTo(x + 27, y);
    ctx.lineTo(x + 36, y);

}

function drawBottomBump(ctx, x, y){

    ctx.lineTo(x + 5, y);
    ctx.lineTo(x + 9, y + 4);
    ctx.lineTo(x + 23, y + 4);
    ctx.lineTo(x + 27, y);
    ctx.lineTo(x + 36, y);

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

/*=========================================
    READY
=========================================*/

window.addEventListener(
    "resize",
    Renderer.resize
);

Renderer.ready = function(){

    return !!ctx;

};

})();
