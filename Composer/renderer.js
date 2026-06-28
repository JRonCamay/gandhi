// renderer.js
(function(){

const Renderer={};

Composer.renderer=Renderer;

let canvas;
let ctx;

Renderer.init=function(container){

    canvas=document.createElement("canvas");

    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
      canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";

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

   ctx.font = "bold 15px Segoe UI";

   const pieces = [];

    const parts = block.preview.split("()");
    
    for(let i=0;i<parts.length;i++){
    
        if(parts[i].length){
    
            pieces.push({
    
                type:"text",
    
                value:parts[i]
    
            });
    
        }
    
        if(i < block.params.length){
    
            pieces.push({
    
                type:block.params[i].type,
    
                value:block.params[i].name
    
            });
    
        }
    
    }
    
    let width = 20;
    
    for(const piece of pieces){
    
        if(piece.type==="text"){
    
            width += ctx.measureText(piece.value).width;
    
        }else{
    
           width += Math.max(
        
                24,
        
                ctx.measureText(piece.value).width + 18
        
            ) + 4;
    
        }
    
    }
    
    width += 20;

    Composer.paths.draw(

        ctx,

        "stack",

        x,

        y,

        width,

        h,

        "#4C97FF"

    );

    ctx.fillStyle = "white";
    ctx.textBaseline = "middle";
    
    let px = x + 12;
    
    for(const piece of pieces){
    
        if(piece.type === "text"){
    
            ctx.fillText(
    
                piece.value,
    
                px,
    
                y + h / 2
    
            );
    
            px += ctx.measureText(piece.value).width;
    
        }
    
        else{
    
            drawSocket(
    
                piece.type,
    
                piece.value,
    
                px,
    
                y + 5
    
            );
    
            const socketWidth = Math.max(

                24,
            
                ctx.measureText(piece.value).width + 18
            
            );
            
            px += socketWidth + 4;
    
        }
    
    }

};
/*=========================================
    PREVIEW
=========================================*/
function drawSocket(type,value,x,y){

   const padding = 18;

    const w = Math.max(
    
        24,
    
        ctx.measureText(value).width + padding
    
    );
    const h = 24;

    switch(type){

        case "number":

        case "string":

        case "reporter":

            Composer.paths.draw(

                ctx,

                "reporter",

                x,

                y,

                w,

                h,

                "#FFFFFF",

                "#B0B0B0"

            );

        break;

        case "boolean":

            Composer.paths.draw(

                ctx,

                "boolean",

                x,

                y,

                w,

                h,

                "#FFFFFF",

                "#B0B0B0"

            );

        break;

        default:

            Composer.paths.draw(

                ctx,

                "reporter",

                x,

                y,

                w,

                h,

                "#FFFFFF",

                "#B0B0B0"

            );

    }

    ctx.fillStyle = "#666";

    ctx.font = "11px Segoe UI";

    ctx.textAlign = "center";

    ctx.textBaseline = "middle";

    ctx.fillText(

        value,

        x + w/2,

        y + h/2

    );

    ctx.textAlign = "left";

    ctx.font = "bold 15px Segoe UI";

}
Renderer.preview=function(command){

    if(!command){

        Renderer.clear();

        return;

    }

    Renderer.draw(command);

};

})();

