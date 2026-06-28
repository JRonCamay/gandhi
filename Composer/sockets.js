// sockets.js
(function(){

const Sockets = {};

Composer.sockets = Sockets;

/*=========================================
    Measure
=========================================*/

Sockets.measure=function(ctx,type,text){

    ctx.save();

    ctx.font="11px Segoe UI";

    let w=Math.max(

        24,

        ctx.measureText(text).width+18

    );

    if(type==="menu")
        w+=12;

    if(type==="boolean")
        w=Math.max(42,w);

    if(type==="color")
        w=22;

    ctx.restore();

    return w;

};

/*=========================================
    Label
=========================================*/

function label(ctx,text,x,y,w,h){

    ctx.save();

    ctx.fillStyle="#666";

    ctx.font="11px Segoe UI";

    ctx.textAlign="center";

    ctx.textBaseline="middle";

    ctx.fillText(

        text,

        x+w/2,

        y+h/2

    );

    ctx.restore();

}

/*=========================================
    Reporter
=========================================*/

Sockets.reporter=function(ctx,text,x,y){

    const w=Sockets.measure(

        ctx,

        "reporter",

        text

    );

    const h=20;

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

    label(

        ctx,

        text,

        x,

        y,

        w,

        h

    );

    return w;

};

Sockets.number=function(ctx,text,x,y){

    return Sockets.reporter(

        ctx,

        text,

        x,

        y

    );

};

Sockets.string=function(ctx,text,x,y){

    return Sockets.reporter(

        ctx,

        text,

        x,

        y

    );

};
/*=========================================
    Menu
=========================================*/

Sockets.menu = function(ctx,text,x,y){

    const w = Sockets.measure(
        ctx,
        "menu",
        text
    );

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

    label(
        ctx,
        text + " ▼",
        x,
        y,
        w,
        h
    );

    return w;

};

/*=========================================
    Boolean
=========================================*/

Sockets.boolean = function(ctx,text,x,y){

    const w = Sockets.measure(
        ctx,
        "boolean",
        text
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

    label(
        ctx,
        text,
        x,
        y,
        w,
        h
    );

    return w;

};

/*=========================================
    Color
=========================================*/

Sockets.color = function(ctx,x,y){

    const w = Sockets.measure(
        ctx,
        "color",
        ""
    );

    const h = 20;

    Composer.paths.draw(
        ctx,
        "reporter",
        x,
        y,
        w,
        h,
        "#FF6680",
        "#D64D66"
    );

    return w;

};

})();
