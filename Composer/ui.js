// ui.js
(function () {

const ui = Composer.ui;

let panel;
let header;
let input;
let preview;
let status;

let drag = false;
let dx = 0;
let dy = 0;

ui.init = function () {

    if (panel) return;

    panel = document.createElement("div");

    panel.id = "composer-panel";

    panel.innerHTML = `
<div id="composer-header">
    <span>🎼 Gandhi Composer</span>
    <button id="composer-close">✕</button>
</div>

<div id="composer-body">

<input
id="composer-editor"
type="text"
spellcheck="false"
autocomplete="off"
placeholder="Type a block..."

>

<div id="composer-preview"></div>

</div>

<div id="composer-status">
Ready
</div>
`;

    document.body.appendChild(panel);

    header = panel.querySelector("#composer-header");
    input = panel.querySelector("#composer-editor");
   preview = panel.querySelector("#composer-preview");

    preview.style.padding = "0";
    preview.style.background = "#202020";
    preview.style.border = "0";
    preview.style.overflow = "hidden";
 
       if(
        Composer.renderer &&
        Composer.renderer.init
    ){
        Composer.renderer.init(preview);
    }
    status = panel.querySelector("#composer-status");

    Object.assign(panel.style,{

        position:"fixed",

        left:"180px",

        top:"120px",

        width:"520px",

        height:"250px",

        background:"#1f1f1f",

        border:"1px solid #444",

        borderRadius:"10px",

        color:"#fff",

        overflow:"hidden",

        display:"none",

        zIndex:999999,

        fontFamily:"Segoe UI,sans-serif",

        boxShadow:"0 10px 30px rgba(0,0,0,.45)"

    });

    Object.assign(header.style,{

        height:"38px",

        display:"flex",

        alignItems:"center",

        justifyContent:"space-between",

        background:"#303030",

        padding:"0 10px",

        cursor:"move",

        userSelect:"none",

        fontWeight:"bold"

    });

    const body = panel.querySelector("#composer-body");

    Object.assign(body.style,{

        padding:"10px"

    });

    Object.assign(input.style,{

        width:"100%",

        boxSizing:"border-box",

        padding:"10px",

        fontSize:"15px",

        borderRadius:"6px",

        border:"1px solid #555",

        outline:"none",

        background:"#111",

        color:"#fff",

        fontFamily:"Consolas,monospace"

    });

    Object.assign(preview.style,{

        marginTop:"10px",

        height:"135px",

        border:"1px solid #444",

        borderRadius:"6px",

        background:"#111",

        overflow:"auto",

        padding:"10px",

        boxSizing:"border-box"

    });
       Object.assign(status.style,{

        position:"absolute",

        left:"0",

        right:"0",

        bottom:"0",

        height:"28px",

        lineHeight:"28px",

        padding:"0 10px",

        background:"#282828",

        color:"#999",

        fontSize:"12px",

        boxSizing:"border-box"

    });

    panel.querySelector("#composer-close").onclick = ui.hide;

    header.addEventListener("mousedown",e=>{

        drag=true;

        dx=e.clientX-panel.offsetLeft;

        dy=e.clientY-panel.offsetTop;

    });

    document.addEventListener("mousemove",e=>{

        if(!drag) return;

        panel.style.left=(e.clientX-dx)+"px";

        panel.style.top=(e.clientY-dy)+"px";

    });

    document.addEventListener("mouseup",()=>{

        drag=false;

    });

   input.addEventListener("input",()=>{

        console.log("UI:",input.value);
    
        if(Composer.generator.preview){
    
            Composer.generator.preview(input.value);
    
        }
    
    });

};
ui.show=function(){

    panel.style.display="block";

    input.focus();

};

ui.hide=function(){

    panel.style.display="none";

};

ui.toggle=function(){

    if(panel.style.display==="none")

        ui.show();

    else

        ui.hide();

};

ui.status=function(text){

    status.textContent=text;

};

ui.setPreview=function(html){

    preview.innerHTML=html;

};

ui.getText=function(){

    return input.value;

};

ui.clear=function(){

    input.value="";

    preview.innerHTML="";

};

ui.init();

document.addEventListener("keydown",e=>{

    if(
        e.ctrlKey &&
        e.shiftKey &&
        e.key.toLowerCase()==="x"
    ){

        e.preventDefault();

        ui.toggle();

    }

    if(e.key==="Escape"){

        ui.hide();

    }

});

})();
