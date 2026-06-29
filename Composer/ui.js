// ui.js
(function () {

const ui = Composer.ui;

let panel;
let header;
let editor;
let preview;
let status;
let clearButton;

let drag = false;
let dx = 0;
let dy = 0;

let smartTypingLock = false;
let lastInputType = "";

const BRACKET_COLORS = [
    "#48D597",
    "#B47CFF",
    "#FFB84D",
    "#4DDCFF",
    "#FF77C8"
];

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
    <div id="composer-input-row">
        <div
            id="composer-editor"
            contenteditable="true"
            spellcheck="false"
            autocomplete="off"
            data-placeholder="Type a block..."
        ></div>
        <button id="composer-clear" title="Clear">Clear</button>
    </div>

    <div id="composer-preview"></div>
</div>

<div id="composer-status">Ready</div>
`;

    document.body.appendChild(panel);

    header = panel.querySelector("#composer-header");
    editor = panel.querySelector("#composer-editor");
    preview = panel.querySelector("#composer-preview");
    status = panel.querySelector("#composer-status");
    clearButton = panel.querySelector("#composer-clear");

    if (Composer.renderer && Composer.renderer.init) {
        Composer.renderer.init(preview);
    }

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
    Object.assign(body.style,{ padding:"10px" });

    const inputRow = panel.querySelector("#composer-input-row");
    Object.assign(inputRow.style,{
        display:"flex",
        gap:"6px"
    });

    Object.assign(editor.style,{
        flex:"1",
        minHeight:"39px",
        boxSizing:"border-box",
        padding:"10px",
        fontSize:"15px",
        borderRadius:"6px",
        border:"1px solid #555",
        outline:"none",
        background:"#111",
        color:"#fff",
        fontFamily:"Consolas,monospace",
        whiteSpace:"pre-wrap",
        overflow:"hidden"
    });

    Object.assign(clearButton.style,{
        width:"62px",
        borderRadius:"6px",
        border:"1px solid #555",
        background:"#333",
        color:"#fff",
        cursor:"pointer"
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

    clearButton.onclick = function () {
        setEditorText("");
        Composer.renderer.clear();
        ui.status("Cleared");
        editor.focus();
    };

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

    document.addEventListener("mouseup",()=>{ drag=false; });

    editor.addEventListener("beforeinput", e => {
        lastInputType = e.inputType || "";
    });

    editor.addEventListener("paste", e => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData("text");
        document.execCommand("insertText", false, text);
    });

    editor.addEventListener("keydown",e=>{
        if(e.key === "Tab" || e.key === "Enter"){
            if(jumpToNextSlot()){
                e.preventDefault();
            }
        }
    });

    editor.addEventListener("input",()=>{
        const cursor = getCaretOffset();
        const text = getEditorText();

        if(!smartTypingLock && !lastInputType.startsWith("delete")){
            const result = getUniversalSmartTypingResult(text, cursor);

            if(result){
                setEditorText(result.text, result.selectStart, result.selectEnd);
                updatePreview();
                return;
            }
        }

        renderEditorText(text);
        setCaretOffset(cursor);
        updatePreview();
    });
};

/*=========================================
    EDITOR TEXT + COLORING
=========================================*/

function getEditorText(){
    return editor.textContent || "";
}

function setEditorText(text, selectStart, selectEnd){
    renderEditorText(text);

    const start = typeof selectStart === "number" ? selectStart : text.length;
    const end = typeof selectEnd === "number" ? selectEnd : start;

    setSelectionOffsets(start, end);
}

function renderEditorText(text){
    if(!text){
        editor.innerHTML = "";
        return;
    }

    let html = "";
    let depth = 0;

    for(let i=0;i<text.length;i++){
        const char = text[i];

        if(char === "["){
            depth++;
            html += bracketSpan(char, depth);
            continue;
        }

        if(char === "]"){
            html += bracketSpan(char, depth);
            depth = Math.max(0, depth - 1);
            continue;
        }

        html += escapeHTML(char);
    }

    editor.innerHTML = html;
}

function bracketSpan(char, depth){
    const color = BRACKET_COLORS[(Math.max(1, depth) - 1) % BRACKET_COLORS.length];
    return `<span style="color:${color};font-weight:bold;">${char}</span>`;
}

function escapeHTML(text){
    return String(text)
        .replace(/&/g,"&amp;")
        .replace(/</g,"&lt;")
        .replace(/>/g,"&gt;")
        .replace(/"/g,"&quot;");
}

function getCaretOffset(){
    const selection = window.getSelection();

    if(!selection || !selection.rangeCount){
        return 0;
    }

    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();

    preRange.selectNodeContents(editor);
    preRange.setEnd(range.startContainer, range.startOffset);

    return preRange.toString().length;
}

function setCaretOffset(offset){
    setSelectionOffsets(offset, offset);
}

function setSelectionOffsets(start, end){
    const range = document.createRange();
    const selection = window.getSelection();

    const startPos = findTextPosition(editor, start);
    const endPos = findTextPosition(editor, end);

    range.setStart(startPos.node, startPos.offset);
    range.setEnd(endPos.node, endPos.offset);

    selection.removeAllRanges();
    selection.addRange(range);
}

function findTextPosition(root, targetOffset){
    let current = 0;
    const walker = document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT,
        null
    );

    let node;

    while((node = walker.nextNode())){
        const next = current + node.nodeValue.length;

        if(targetOffset <= next){
            return {
                node,
                offset: targetOffset - current
            };
        }

        current = next;
    }

    if(!root.firstChild){
        const textNode = document.createTextNode("");
        root.appendChild(textNode);

        return {
            node:textNode,
            offset:0
        };
    }

    return {
        node:root,
        offset:root.childNodes.length
    };
}

/*=========================================
    PREVIEW
=========================================*/

function updatePreview(){

    const text = getEditorText();

    if(!Composer.generator){
        return;
    }

    Composer.generator.preview(text);

}

/*=========================================
    UNIVERSAL SMART TYPING
=========================================*/

function getUniversalSmartTypingResult(value, cursor){
    const slot = getInnermostSlot(value, cursor);

    if(slot){
        const innerText = value.slice(slot.innerStart, slot.innerEnd);
        const innerCursor = cursor - slot.innerStart;

        if(innerCursor !== innerText.length){
            return null;
        }

        const innerResult = getSmartTypingResult(innerText);

        if(!innerResult){
            return null;
        }

        const newText =
            value.slice(0, slot.innerStart) +
            innerResult.text +
            value.slice(slot.innerEnd);

        return {
            text:newText,
            selectStart:slot.innerStart + innerResult.selectStart,
            selectEnd:slot.innerStart + innerResult.selectEnd
        };
    }

    if(cursor !== value.length){
        return null;
    }

    return getSmartTypingResult(value);
}

function getSmartTypingResult(value){
    const templates = getTemplates();

    const operator = getOperatorTemplateResult(value, templates);
    if(operator) return operator;

    let best = null;

    for(const template of templates){
        const result = getTemplateCompletion(value, template, templates);

        if(!result) continue;

        if(!best || result.text.length < best.text.length){
            best = result;
        }
    }

    return best;
}

/*=========================================
    TEMPLATE COLLECTION
=========================================*/

function getTemplates(){

    const found = [];

    if(
        Composer.blocks &&
        typeof Composer.blocks.getAll === "function"
    ){
        collectTemplates(
            Composer.blocks.getAll(),
            found
        );
    }else{
        collectTemplates(
            Composer.library,
            found
        );
    }

    const fallback = [

        "move [] steps",
        "turn clockwise [] degrees",
        "turn counterclockwise [] degrees",
        "go to []",
        "go to x: [] y: []",

        "say []",
        "say [] for [] seconds",
        "think []",
        "think [] for [] seconds",

        "repeat []",
        "wait [] seconds",
        "if [] then",
        "if on edge, bounce",

        "[] + []",
        "[] - []",
        "[] * []",
        "[] / []",
        "[] mod []",
        "[] < []",
        "[] = []",
        "[] > []",

        "not []",
        "[] and []",
        "[] or []",

        "pick random [] to []",
        "join [] []",
        "letter [] of []",
        "length of []",
        "contains [] ?",

        "item [] of []",
        "item # of [] in []",
        "length of []",

        "round []",
        "abs []",
        "floor []",
        "ceiling []",
        "sqrt []",
        "sin []",
        "cos []",
        "tan []",
        "asin []",
        "acos []",
        "atan []",
        "ln []",
        "log []",
        "e ^ []",
        "10 ^ []",

        "mouse x",
        "mouse y",
        "x position",
        "y position",
        "direction"

    ];

    for(const item of fallback){
        found.push(item);
    }

    return unique(found)
        .map(normalizeTemplate)
        .filter(Boolean);

}

function collectTemplates(source, result){

    if(!source) return;

    if(Array.isArray(source)){

        for(const item of source){

            if(item && item.pattern){
                result.push(item.pattern);
            }

            if(item && item.preview){
                result.push(item.preview);
            }

        }

        return;

    }

    if(typeof source === "object"){

        if(source.pattern){
            result.push(source.pattern);
        }

        if(source.preview){
            result.push(source.preview);
        }

    }

}
function normalizeTemplate(template){
    if(!template || typeof template !== "string") return null;

    return template
        .replace(/\(\)/g, "[]")
        .replace(/\[\s*\]/g, "[]")
        .replace(/\s+/g, " ")
        .trim();
}

function unique(list){
    const seen = new Set();
    const result = [];

    for(const item of list){
        const normalized = normalizeTemplate(item);

        if(!normalized || seen.has(normalized)) continue;

        seen.add(normalized);
        result.push(normalized);
    }

    return result;
}

/*=========================================
    TEMPLATE MATCHING
=========================================*/

function splitTemplate(template){
    const parts = [];
    const re = /\[\]/g;

    let index = 0;
    let match;

    while((match = re.exec(template))){
        if(match.index > index){
            parts.push({
                type:"text",
                value:template.slice(index, match.index)
            });
        }

        parts.push({ type:"slot" });

        index = match.index + 2;
    }

    if(index < template.length){
        parts.push({
            type:"text",
            value:template.slice(index)
        });
    }

    return parts;
}

function getTemplateCompletion(value, template, allTemplates){
    const explicitSlotStart = value.endsWith("[");
    const matchValue = explicitSlotStart ? value.slice(0, -1) : value;

    if(!explicitSlotStart && hasSharedTextContinuation(matchValue, allTemplates)){
        return null;
    }

    const parts = splitTemplate(template);

    if(!parts.some(part => part.type === "slot")){
        return null;
    }

    for(let i=0;i<parts.length;i++){
        if(parts[i].type !== "slot") continue;

        const prefixParts = parts.slice(0, i);
        const prefixRegex = new RegExp(
            "^" + partsToRegex(prefixParts) + "$",
            "i"
        );

        if(!prefixRegex.test(matchValue)) continue;

        return buildCompletedText(matchValue, parts, i);
    }

    return null;
}

function hasSharedTextContinuation(value, templates){
    if(!value) return false;

    const lowerValue = value.toLowerCase();

    for(const template of templates){
        const lowerTemplate = template.toLowerCase();

        if(!lowerTemplate.startsWith(lowerValue)) continue;

        const next = template[value.length];

        if(next && next !== "["){
            return true;
        }
    }

    return false;
}

function partsToRegex(parts){
    let result = "";

    for(const part of parts){
        if(part.type === "text"){
            result += escapeRegex(part.value);
        }else{
            result += "\\[[^\\]]*\\]";
        }
    }

    return result;
}

function buildCompletedText(value, parts, slotIndex){
    let output = value;
    let selectStart = null;
    let selectEnd = null;

    for(let i=slotIndex;i<parts.length;i++){
        const part = parts[i];

        if(part.type === "slot"){
            const start = output.length;
            output += "[ ]";

            if(selectStart === null){
                selectStart = start + 1;
                selectEnd = start + 2;
            }
        }else{
            output += part.value;
        }
    }

    return {
        text:output,
        selectStart,
        selectEnd
    };
}

/*=========================================
    OPERATORS AS NORMAL TEMPLATES
=========================================*/

function getOperatorTemplateResult(value, templates){
    const typed = value.trim();

    if(!typed) return null;

    for(const template of templates){
        const parts = splitTemplate(template);

        if(
            parts.length === 3 &&
            parts[0].type === "slot" &&
            parts[1].type === "text" &&
            parts[2].type === "slot" &&
            parts[1].value.trim().toLowerCase() === typed.toLowerCase()
        ){
            const text = "[ ]" + parts[1].value + "[ ]";

            return {
                text,
                selectStart:1,
                selectEnd:2
            };
        }
    }

    return null;
}

/*=========================================
    SLOT NAVIGATION
=========================================*/

function jumpToNextSlot(){
    const value = getEditorText();
    const cursor = getCaretOffset();
    const selection = window.getSelection();

    const selectionStart = cursor;
    const selectionEnd = selection && selection.rangeCount
        ? selection.toString().length + selectionStart
        : cursor;

    const slots = getSelectableSlots(value);

    if(!slots.length) return false;

    let startAfter = cursor;

    for(const slot of slots){
        if(
            selectionStart === slot.innerStart &&
            selectionEnd === slot.innerEnd
        ){
            startAfter = slot.end;
            break;
        }
    }

    for(const slot of slots){
        if(slot.innerStart > startAfter || slot.end > startAfter){
            setSelectionOffsets(slot.innerStart, slot.innerEnd);
            return true;
        }
    }

    return false;
}

function getSelectableSlots(text){
    const all = getSlots(text);

    return all.filter(slot => {
        const inner = text.slice(slot.innerStart, slot.innerEnd);
        return !inner.includes("[") && !inner.includes("]");
    });
}

function getSlots(text){
    const slots = [];

    for(let i=0;i<text.length;i++){
        if(text[i] !== "[") continue;

        const end = findClosingBracket(text, i);

        if(end === -1) continue;

        slots.push({
            start:i,
            end:end + 1,
            innerStart:i + 1,
            innerEnd:end
        });
    }

    return slots.sort((a,b)=>a.start-b.start);
}

function getInnermostSlot(text, cursor){
    const slots = getSlots(text).filter(slot =>
        cursor >= slot.innerStart &&
        cursor <= slot.innerEnd
    );

    if(!slots.length) return null;

    return slots.sort((a,b)=>
        (a.end - a.start) - (b.end - b.start)
    )[0];
}

function findClosingBracket(text, start){
    let depth = 0;

    for(let i=start;i<text.length;i++){
        if(text[i] === "[") depth++;

        if(text[i] === "]"){
            depth--;

            if(depth === 0){
                return i;
            }
        }
    }

    return -1;
}

function escapeRegex(text){
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/*=========================================
    PUBLIC UI API
=========================================*/

ui.show=function(){
    panel.style.display="block";

    requestAnimationFrame(()=>{
        Composer.renderer.resize();
    });

    editor.focus();
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
    return getEditorText();
};

ui.clear=function(){
    setEditorText("");
    Composer.renderer.clear();
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
