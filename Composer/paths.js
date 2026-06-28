// paths.js
(function(){

const Shape = {};

Composer.paths = Shape;

/*=========================================
    Helpers
=========================================*/

function roundRect(ctx,x,y,w,h,r){

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
        y+h-r
    );

    ctx.quadraticCurveTo(
        x+w,
        y+h,
        x+w-r,
        y+h
    );

    ctx.lineTo(
        x+r,
        y+h
    );

    ctx.quadraticCurveTo(
        x,
        y+h,
        x,
        y+h-r
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

}

/*=========================================
    Stack Block
=========================================*/

Shape.stack=function(ctx,x,y,w,h){

    const r = 4;

    const nx = 18;
    const nw = 14;
    const nd = 4;

    ctx.beginPath();

    ctx.moveTo(x+r,y);

    ctx.lineTo(x+nx,y);

    ctx.lineTo(x+nx,y+nd);

    ctx.lineTo(x+nx+nw,y+nd);

    ctx.lineTo(x+nx+nw,y);

    ctx.lineTo(x+w-r,y);

    ctx.quadraticCurveTo(
        x+w,
        y,
        x+w,
        y+r
    );

    ctx.lineTo(
        x+w,
        y+h-r
    );

    ctx.quadraticCurveTo(
        x+w,
        y+h,
        x+w-r,
        y+h
    );

    ctx.lineTo(
        x+nx+nw,
        y+h
    );

    ctx.lineTo(
        x+nx+nw,
        y+h+nd
    );

    ctx.lineTo(
        x+nx,
        y+h+nd
    );

    ctx.lineTo(
        x+nx,
        y+h
    );

    ctx.lineTo(
        x+r,
        y+h
    );

    ctx.quadraticCurveTo(
        x,
        y+h,
        x,
        y+h-r
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
    Reporter
=========================================*/

Shape.reporter = function(ctx,x,y,w,h){

    const r = h / 2;

    ctx.beginPath();

    ctx.moveTo(x+r,y);

    ctx.lineTo(x+w-r,y);

    ctx.arc(
        x+w-r,
        y+r,
        r,
        -Math.PI/2,
        Math.PI/2
    );

    ctx.lineTo(x+r,y+h);

    ctx.arc(
        x+r,
        y+r,
        r,
        Math.PI/2,
        -Math.PI/2
    );

    ctx.closePath();

};

/*=========================================
    Boolean
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
    Hat
=========================================*/

Shape.hat = function(ctx,x,y,w,h){

    const r = 4;

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

    ctx.lineTo(x,y+h);

    ctx.closePath();

};
/*=========================================
    Cap
=========================================*/

Shape.cap = function(ctx,x,y,w,h){

    const r = 4;

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
        y+h-10
    );

    ctx.quadraticCurveTo(
        x+w/2,
        y+h+10,
        x,
        y+h-10
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
    Draw Helper
=========================================*/

Shape.draw = function(
    ctx,
    type,
    x,
    y,
    w,
    h,
    fill,
    stroke
){

    if(!Shape[type]) return;

    Shape[type](
        ctx,
        x,
        y,
        w,
        h
    );

    ctx.fillStyle = fill || "#4C97FF";
    ctx.fill();

    ctx.lineWidth = 1;

    ctx.strokeStyle = stroke || "#3373CC";
    ctx.stroke();

};

})();
