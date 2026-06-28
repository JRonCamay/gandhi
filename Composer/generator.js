(function(){

const input=document.getElementById("composer-input");
const preview=document.getElementById("composer-preview");

function renderPreview(entry){

    preview.innerHTML="";

    if(!entry)return;

    const card=document.createElement("div");

    card.textContent=entry.label;

    card.style.cssText=`
        background:#4C97FF;
        color:white;
        padding:8px 12px;
        border-radius:6px;
        display:inline-block;
        font-weight:bold;
        cursor:pointer;
    `;

    card.onclick=()=>{

        const ws=(window.Blockly||window.ScratchBlocks).getMainWorkspace();

        const block=ws.newBlock(entry.block);

        block.initSvg();
        block.render();

        block.moveBy(250,150);

    };

    preview.append(card);

}

input.addEventListener("input",()=>{

    const text=input.value.trim().toLowerCase();

    if(!text){

        renderPreview(null);

        return;

    }

    const found=Composer.library.find(x=>x.keyword.startsWith(text));

    renderPreview(found);

});

})();
