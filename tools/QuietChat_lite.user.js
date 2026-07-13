// ==UserScript==
// @name         QuietChat Lite
// @namespace    https://chatgpt.com/
// @version      0.1.0
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
  const ID="qc-lite-root",API="http://127.0.0.1:8765/quietchat/api";
  let busy=false,timer=null;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  function req(path,payload){
    const body=JSON.stringify(payload||{});
    if(typeof GM_xmlhttpRequest==="function")return new Promise((ok,fail)=>GM_xmlhttpRequest({method:"POST",url:API+path,headers:{"Content-Type":"application/json"},data:body,timeout:12000,onload:r=>{try{const d=JSON.parse(r.responseText||"{}");if(r.status>=400||d.status==="error")fail(new Error(d.msg||d.error||"bridge error"));else ok(d);}catch(e){fail(e);}},onerror:()=>fail(new Error("bridge offline")),ontimeout:()=>fail(new Error("bridge timeout"))}));
    return fetch(API+path,{method:"POST",headers:{"Content-Type":"application/json"},body}).then(r=>r.json());
  }
  async function view(){
    try{return (await req("/view",{cmd:"qc.view",params:{chatUrl:location.href,limit:20,scanLimit:80,staleAfter:120}})).result;}
    catch(e){const d=await req("/scan",{chat_url:location.href,limit:20});return {messages:d.messages||[],hiddenRecords:0,latestState:(d.messages||[]).at(-1)?.state};}
  }
  function boot(){
    if(document.getElementById(ID))return;
    const h=document.createElement("div");h.id=ID;h.innerHTML=`
      <style>
        #${ID}{position:fixed;right:24px;bottom:24px;z-index:2147483646;font:13px system-ui;color:#eee}
        #${ID} *{box-sizing:border-box}
        .qcw{width:min(760px,calc(100vw - 48px));height:min(680px,calc(100vh - 80px));display:flex;flex-direction:column;background:#282828;border:1px solid #555;border-radius:16px;box-shadow:0 20px 70px #0009;overflow:hidden}
        .qch{height:48px;display:flex;align-items:center;gap:8px;padding:0 12px;background:#303030;border-bottom:1px solid #444}
        .qct{font-weight:700;flex:1}.qcs{font-size:11px;color:#aaa}
        button{border:1px solid #555;background:#3a3a3a;color:#eee;border-radius:9px;padding:7px 10px;cursor:pointer}button:disabled{opacity:.45;cursor:not-allowed}
        .qcb{flex:1;overflow:auto;padding:18px;background:#242424}.msg{max-width:88%;margin:0 0 14px;line-height:1.45;white-space:pre-wrap}.u{margin-left:auto;background:#3c3c3c;padding:10px 12px;border-radius:14px 14px 4px 14px}.a{margin-right:auto}.a:before{content:"QuietChat";display:block;color:#8fd;opacity:.8;font-size:11px;margin-bottom:4px}
        .qcf{display:flex;gap:8px;padding:12px;background:#303030;border-top:1px solid #444}textarea{flex:1;min-height:42px;max-height:150px;resize:vertical;background:#3a3a3a;color:#eee;border:1px solid #555;border-radius:12px;padding:10px;outline:none}.stat{padding:6px 12px;text-align:center;color:#aaa;font-size:11px;background:#303030;border-top:1px solid #444}
      </style>
      <section class=qcw><div class=qch><div><div class=qct>QuietChat Lite</div><div class=qcs>daemon view · max 20</div></div><button class=scan>Scan</button><button class=hide>Dock</button></div><main class=qcb></main><div class=stat>ready</div><footer class=qcf><textarea placeholder="Message QuietChat..."></textarea><button class=send>Send</button></footer></section>`;
    document.documentElement.appendChild(h);
    h.querySelector(".scan").onclick=()=>load();
    h.querySelector(".hide").onclick=()=>{const w=h.querySelector(".qcw");w.style.display=w.style.display==="none"?"flex":"none";};
    h.querySelector(".send").onclick=send;
    load();
    timer=setInterval(load,5000);
  }
  function stat(t){document.querySelector(`#${ID} .stat`).textContent=t;}
  function lock(on){busy=on;document.querySelector(`#${ID} .send`).disabled=on;}
  function render(d){
    const box=document.querySelector(`#${ID} .qcb`),m=d.messages||[];
    box.innerHTML=m.length?"":"<div class=a>No QuietChat messages.</div>";
    for(const r of m){
      if(r.user_message)box.insertAdjacentHTML("beforeend",`<div class="msg u">${esc(r.user_message)}</div>`);
      box.insertAdjacentHTML("beforeend",`<div class="msg a">${esc(r.assistant_reply||statusText(r))}</div>`);
    }
    box.scrollTop=box.scrollHeight;
    const locked=["pending","running"].includes(d.latestState);
    lock(locked);
    stat(`${m.length} shown · ${d.hiddenRecords||0} hidden · ${d.latestState||"ready"}`);
  }
  function statusText(r){const l=(r.status_log||[]).at(-1);return `[${r.state||"pending"}] ${(l&&l.note)||"Waiting for reply."}`;}
  async function load(){try{render(await view());}catch(e){stat("bridge offline: "+e.message);lock(false);}}
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