// ==UserScript==
// @name         QuietChat Lite
// @namespace    https://chatgpt.com/
// @version      0.1.2
// @description  Small QuietChat UI using daemon qc.view.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==

(function(){
  "use strict";
  if(window.__qcLiteV1)return;
  window.__qcLiteV1=true;
  const ID="qc-lite-root",API="http://127.0.0.1:8765/quietchat/api",POS="qc-lite-pos-v1",VER="0.1.2";
  let busy=false,timer=null,pos=0,last=[],win=10,init=false,toNewest=false,rendering=false,jump=false;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  function req(path,payload){
    const body=JSON.stringify(payload||{});
    if(typeof GM_xmlhttpRequest==="function")return new Promise((ok,fail)=>GM_xmlhttpRequest({method:"POST",url:API+path,headers:{"Content-Type":"application/json"},data:body,timeout:12000,onload:r=>{try{const d=JSON.parse(r.responseText||"{}");if(r.status>=400||d.status==="error")fail(new Error(d.msg||d.error||"bridge error"));else ok(d);}catch(e){fail(e);}},onerror:()=>fail(new Error("bridge offline")),ontimeout:()=>fail(new Error("bridge timeout"))}));
    return fetch(API+path,{method:"POST",headers:{"Content-Type":"application/json"},body}).then(r=>r.json());
  }
  async function view(){
    try{return (await req("/view",{cmd:"qc.view",params:{chatUrl:location.href,limit:80,scanLimit:80,staleAfter:120}})).result;}
    catch(e){const d=await req("/scan",{chat_url:location.href,limit:80});return {messages:d.messages||[],hiddenRecords:0,latestState:(d.messages||[]).at(-1)?.state};}
  }
  function boot(){
    if(document.getElementById(ID))return;
    const h=document.createElement("div");h.id=ID;h.innerHTML=`
      <style>
        #${ID}{position:fixed;right:24px;bottom:24px;z-index:2147483646;font:13px system-ui;color:#eee}
        #${ID} *{box-sizing:border-box}
        .qcw{position:relative;width:min(760px,calc(100vw - 48px));height:min(680px,calc(100vh - 80px));display:flex;flex-direction:column;background:#282828;border:1px solid #555;border-radius:16px;box-shadow:0 20px 70px #0009;overflow:hidden}
        .qcw.min{width:180px;height:48px}.qcw.min .qcb,.qcw.min .stat,.qcw.min .qcf{display:none}.qcw.min .qch{border:0}.qcw.min .qcs,.qcw.min .scan{display:none}
        .qch{height:48px;display:flex;align-items:center;gap:8px;padding:0 12px;background:#303030;border-bottom:1px solid #444;cursor:grab;user-select:none}
        .qch.drag{cursor:grabbing}
        .qct{font-weight:700;flex:1}.qcs{font-size:11px;color:#aaa}
        #${ID} button{border:1px solid #555;background:#3a3a3a;color:#eee;border-radius:9px;padding:7px 10px;cursor:pointer}#${ID} button:disabled{opacity:.45;cursor:not-allowed}
        .qca{position:relative;flex:1;min-height:0;background:#242424}.qcb{height:100%;overflow:auto;padding:18px 18px 54px;background:#242424}.msg{max-width:88%;margin:0 0 14px;line-height:1.45;white-space:pre-wrap}.u{margin-left:auto;background:#3c3c3c;padding:10px 12px;border-radius:14px 14px 4px 14px}.a{margin-right:auto}.a:before{content:"QuietChat";display:block;color:#8fd;opacity:.8;font-size:11px;margin-bottom:4px}
        .qcf{display:flex;gap:8px;padding:12px;background:#303030;border-top:1px solid #444}#${ID} textarea{flex:1;min-height:42px;max-height:150px;resize:vertical;background:#3a3a3a;color:#eee;border:1px solid #555;border-radius:12px;padding:10px;outline:none}.stat{padding:6px 12px;text-align:center;color:#aaa;font-size:11px;background:#303030;border-top:1px solid #444}
        .newest{position:absolute;left:50%;bottom:8px;transform:translateX(-50%);width:38px;height:38px;border-radius:999px!important;font-size:18px;z-index:2;display:none}
      </style>
      <section class=qcw><div class=qch><div><div class=qct>QuietChat Lite <span style="font-size:10px;color:#999">v${VER}</span></div><div class=qcs>daemon view · 10 sliding</div></div><button class=scan>Scan</button><button class=hide>Dock</button></div><div class=qca><main class=qcb></main><button class=newest title="Newest">↓</button></div><div class=stat>ready</div><footer class=qcf><textarea placeholder="Message QuietChat..."></textarea><button class=send>Send</button></footer></section>`;
    document.documentElement.appendChild(h);
    place(h);
    drag(h);
    h.querySelector(".scan").onclick=()=>jumpNewest();
    h.querySelector(".newest").onclick=()=>jumpNewest();
    h.querySelector(".hide").onclick=()=>{const w=h.querySelector(".qcw"),b=h.querySelector(".hide");w.classList.toggle("min");b.textContent=w.classList.contains("min")?"Open":"Dock";};
    h.querySelector(".send").onclick=send;
    load();
    h.querySelector(".qcb").onscroll=e=>{if(rendering)return;const b=e.target;if(last.length<=win)return;if(b.scrollTop<8&&pos>0){pos-=1;render({messages:last,hiddenRecords:0},true);}};
    timer=setInterval(()=>{if(pos>=Math.max(0,last.length-win))load(false);},5000);
  }
  function place(h){
    try{const p=JSON.parse(localStorage.getItem(POS)||"{}");if(Number.isFinite(p.x)&&Number.isFinite(p.y)){h.style.left=p.x+"px";h.style.top=p.y+"px";h.style.right="auto";h.style.bottom="auto";}}catch{}
  }
  function drag(h){
    const hd=h.querySelector(".qch");let sx=0,sy=0,ox=0,oy=0,on=false;
    hd.addEventListener("pointerdown",e=>{if(e.target.closest("button"))return;on=true;sx=e.clientX;sy=e.clientY;const r=h.getBoundingClientRect();ox=r.left;oy=r.top;hd.classList.add("drag");hd.setPointerCapture(e.pointerId);});
    hd.addEventListener("pointermove",e=>{if(!on)return;const x=Math.max(0,Math.min(innerWidth-80,ox+e.clientX-sx)),y=Math.max(0,Math.min(innerHeight-48,oy+e.clientY-sy));h.style.left=x+"px";h.style.top=y+"px";h.style.right="auto";h.style.bottom="auto";});
    hd.addEventListener("pointerup",e=>{if(!on)return;on=false;hd.classList.remove("drag");const r=h.getBoundingClientRect();localStorage.setItem(POS,JSON.stringify({x:Math.round(r.left),y:Math.round(r.top)}));try{hd.releasePointerCapture(e.pointerId);}catch{};});
  }
  function stat(t){document.querySelector(`#${ID} .stat`).textContent=t;}
  function lock(on){busy=on;document.querySelector(`#${ID} .send`).disabled=on;}
  function jumpNewest(){toNewest=true;jump=true;load(true);}
  function render(d,fromTop=false){
    last=d.messages||last||[];
    const max=Math.max(0,last.length-win);
    const first=!init;
    if(!init||toNewest){pos=max;init=true;toNewest=false;}
    if(pos>max)pos=max;
    if(pos<0)pos=0;
    const box=document.querySelector(`#${ID} .qcb`),all=last,m=all.slice(pos,pos+win);
    rendering=true;
    box.innerHTML=m.length?"":"<div class=a>No QuietChat messages.</div>";
    if(all.length>win)box.insertAdjacentHTML("beforeend",`<div class="msg a">Window ${pos+1}-${Math.min(pos+win,all.length)} of ${all.length}. Scroll up/down shifts one.</div>`);
    for(const r of m){
      if(r.user_message)box.insertAdjacentHTML("beforeend",`<div class="msg u">${esc(r.user_message)}</div>`);
      box.insertAdjacentHTML("beforeend",`<div class="msg a">${esc(r.assistant_reply||statusText(r))}</div>`);
    }
    if(jump||first)box.scrollTop=box.scrollHeight;
    else if(fromTop)box.scrollTop=16;
    jump=false;
    setTimeout(()=>{rendering=false;},120);
    const locked=["pending","running"].includes((all.at(-1)||{}).state);
    lock(locked);
    const nb=document.querySelector(`#${ID} .newest`);
    if(nb)nb.style.display=pos<max?"block":"none";
    stat(`${m.length} shown · window ${pos+1}-${Math.min(pos+win,all.length)} of ${all.length} · ${(all.at(-1)||{}).state||"ready"}`);
  }
  function statusText(r){const l=(r.status_log||[]).at(-1);return `[${r.state||"pending"}] ${(l&&l.note)||"Waiting for reply."}`;}
  async function load(allowJump=false){try{if(allowJump)jump=true;render(await view());}catch(e){stat("bridge offline: "+e.message);lock(false);}}
  async function send(){
    if(busy)return;
    const ta=document.querySelector(`#${ID} textarea`),txt=ta.value.trim();
    if(!txt)return;
    lock(true);stat("creating...");
    try{
      const d=await req("/create",{chat_url:location.href,conversation_title:document.title||"ChatGPT",user_message:txt,metadata:{source:"qc-lite",url:location.href}});
      ta.value="";await load();sendToChat(d.trigger||`Use quietchat_process_message for ${d.message_id}.`);
    }catch(e){stat("send failed: "+e.message);lock(false);}
  }
  function sendToChat(t){
    const ed=document.querySelector("#prompt-textarea")||document.querySelector('[contenteditable="true"]');
    if(!ed){stat("ChatGPT textbox missing");return;}
    ed.focus();
    if(ed.tagName==="TEXTAREA"){ed.value=t;ed.dispatchEvent(new Event("input",{bubbles:true}));}
    else{ed.textContent=t;ed.dispatchEvent(new InputEvent("input",{bubbles:true,inputType:"insertText",data:t}));}
    setTimeout(()=>document.querySelector('[data-testid="send-button"],button[aria-label="Send message"]')?.click(),150);
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();