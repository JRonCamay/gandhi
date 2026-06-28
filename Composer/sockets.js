// sockets.js
(function(){

const Sockets = {};

Composer.sockets = Sockets;

function socketWidth(ctx,text){

    ctx.save();

    ctx.font = "11px Segoe UI";

    const w = Math.max(
        24,
        ctx.measureText(text).width + 18
    );

    ctx.restore();

    return w;

}

Sockets.number = function(ctx,value,x,y){

    const w = socketWidth(ctx,value);
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

    ctx.save();

    ctx.fillStyle = "#666";
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        value,
        x+w/2,
        y+h/2
    );

    ctx.restore();

    return w;

};

Sockets.string = function(ctx,value,x,y){

    return Sockets.number(
        ctx,
        value,
        x,
        y
    );

};

Sockets.reporter = function(ctx,value,x,y){

    return Sockets.number(
        ctx,
        value,
        x,
        y
    );

};
Sockets.menu = function(ctx,value,x,y){

    const w = socketWidth(ctx,value) + 12;
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

    ctx.save();

    ctx.fillStyle = "#666";
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        value + " ▼",
        x + w/2,
        y + h/2
    );

    ctx.restore();

    return w;

};

Sockets.boolean = function(ctx,value,x,y){

    const w = Math.max(
        42,
        socketWidth(ctx,value)
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

    ctx.save();

    ctx.fillStyle = "#666";
    ctx.font = "11px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.fillText(
        value,
        x + w/2,
        y + h/2
    );

    ctx.restore();

    return w;

};

Sockets.color = function(ctx,x,y){

    const w = 22;
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
