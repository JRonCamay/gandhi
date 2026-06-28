// paths.js
(function () {

const Shape = {};

Composer.paths = Shape;

/*=========================================
    STACK BLOCK
=========================================*/

Shape.stack = function (ctx,x,y,w,h) {

    const r = 4;

    const notchWidth = 14;
    const notchDepth = 4;
    const notchX = 18;

    const notchW = 16;
    const notchH = 4;

    ctx.beginPath();

    // top left
    ctx.moveTo(x+r,y);

    // top
    ctx.lineTo(x+18,y);

    // notch
   // Scratch notch

    ctx.lineTo(
        x + notchX,
        y
    );
    
    ctx.lineTo(
        x + notchX,
        y + notchDepth
    );
    
    ctx.lineTo(
        x + notchX + notchWidth,
        y + notchDepth
    );
    
    ctx.lineTo(
        x + notchX + notchWidth,
        y
    );
    ctx.lineTo(x+w-r,y);

    // top right
    ctx.quadraticCurveTo(
        x+w,
        y,
        x+w,
        y+r
    );

    // right
    ctx.lineTo(
        x+w,
        y+h-r
    );

    // bottom right
    ctx.quadraticCurveTo(
        x+w,
        y+h,
        x+w-r,
        y+h
    );

    // bottom notch
    ctx.lineTo(x+18+notchW,y+h);

    ctx.lineTo(x+18+notchW,y+h+notchH);

    ctx.lineTo(x+18,y+h+notchH);

    ctx.lineTo(x+18,y+h);

    ctx.lineTo(x+r,y+h);

    // bottom left
    ctx.quadraticCurveTo(
        x,
        y+h,
        x,
        y+h-r
    );

    // left
    ctx.lineTo(
        x,
        y+r
    );

    // top left
    ctx.quadraticCurveTo(
        x,
        y,
        x+r,
        y
    );

    ctx.closePath();

};
/*=========================================
    REPORTER BLOCK
=========================================*/

Shape.reporter = function (ctx,x,y,w,h){

    const r = h/2;

    ctx.beginPath();

    ctx.moveTo(x+r,y);

    ctx.lineTo(x+w-r,y);

    ctx.arc(
        x+w-r,
        y+r,
        r,
        -Math.PI/2,
        Math.PI/2,
        false
    );

    ctx.lineTo(x+r,y+h);

    ctx.arc(
        x+r,
        y+r,
        r,
        Math.PI/2,
        -Math.PI/2,
        false
    );

    ctx.closePath();

};

/*=========================================
    BOOLEAN BLOCK
=========================================*/

Shape.boolean = function(ctx,x,y,w,h){

    const m = h/2;

    ctx.beginPath();

    ctx.moveTo(x+m,y);

    ctx.lineTo(x+w-m,y);

    ctx.lineTo(x+w,y+m);

    ctx.lineTo(x+w-m,y+h);

    ctx.lineTo(x+m,y+h);

    ctx.lineTo(x,y+m);

    ctx.closePath();

};

/*=========================================
    CAP BLOCK
=========================================*/

Shape.cap = function(ctx,x,y,w,h){

    const r = 6;

    ctx.beginPath();

    ctx.moveTo(x+r,y);

    ctx.lineTo(x+w-r,y);

    ctx.quadraticCurveTo(
        x+w,
        y,
        x+w,
        y+r
    );

    ctx.lineTo(
        x+w,
        y+h-12
    );

    ctx.quadraticCurveTo(
        x+w/2,
        y+h+10,
        x,
        y+h-12
    );

    ctx.lineTo(
        x,
        y+r
    );

    ctx.quadraticCurveTo(
        x,
        y,
        x+r,
        y
    );

    ctx.closePath();

};
/*=========================================
    HAT BLOCK
=========================================*/

Shape.hat = function(ctx,x,y,w,h){

    const r = 6;

    ctx.beginPath();

    ctx.moveTo(x,y+h);

    ctx.lineTo(x,y+18);

    ctx.bezierCurveTo(
        x,
        y,
        x+28,
        y,
        x+44,
        y
    );

    ctx.lineTo(x+w-r,y);

    ctx.quadraticCurveTo(
        x+w,
        y,
        x+w,
        y+r
    );

    ctx.lineTo(x+w,y+h-r);

    ctx.quadraticCurveTo(
        x+w,
        y+h,
        x+w-r,
        y+h
    );

    ctx.lineTo(x+34,y+h);

    ctx.lineTo(x+34,y+h+4);

    ctx.lineTo(x+18,y+h+4);

    ctx.lineTo(x+18,y+h);

    ctx.lineTo(x,y+h);

    ctx.closePath();

};

/*=========================================
    DRAW HELPER
=========================================*/

Shape.draw=function(ctx,type,x,y,w,h,fill,stroke){

    if(!Shape[type]) return;

    Shape[type](ctx,x,y,w,h);

    ctx.fillStyle=fill||"#4C97FF";
    ctx.fill();

    ctx.lineWidth = 1;
    
    ctx.strokeStyle = stroke || "#2F6DBA";
    
    ctx.stroke();

};

})();
