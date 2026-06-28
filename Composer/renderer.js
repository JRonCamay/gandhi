// renderer.js
(function(){

const Renderer={};

Composer.renderer=Renderer;

let canvas;
let ctx;

Renderer.init=function(container){

    canvas=document.createElement("canvas");

    canvas.width=470;

    canvas.height=120;

    canvas.style.width="100%";

    canvas.style.height="120px";

    container.innerHTML="";

    container.appendChild(canvas);

    ctx=canvas.getContext("2d");

};

Renderer.clear=function(){

    if(!ctx) return;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

};

Renderer.draw=function(block){

    if(!ctx) return;

    Renderer.clear();

    const x=15;
    const y=20;

    const h=34;

    ctx.font="15px Segoe UI";

    const padding=16;

    let width=padding;

    const pieces=[];

    pieces.push({
        type:"text",
        value:block.preview
    });

    for(const p of pieces){

        width+=ctx.measureText(
            p.value
        ).width;

    }

    width+=padding;

    Composer.paths.draw(

        ctx,

        "stack",

        x,

        y,

        width,

        h,

        "#4C97FF"

    );

    ctx.fillStyle="white";

    ctx.textBaseline="middle";

    ctx.fillText(

        block.preview,

        x+12,

        y+h/2

    );

};
/*=========================================
    PREVIEW
=========================================*/

Renderer.preview=function(command){

    if(!command){

        Renderer.clear();

        return;

    }

    Renderer.draw(command);

};

})();

})();
