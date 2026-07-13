// ==UserScript==
// @name         QuietChat Refresh Recovery
// @namespace    https://chatgpt.com/
// @version      0.1.0
// @description  Restore pending QuietChat state after tab refresh.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-idle
// ==/UserScript==

(function(){
  "use strict";
  if(window.__quietChatRefreshRecoveryV1)return;
  window.__quietChatRefreshRecoveryV1=true;

  const ROOT_ID="quietchat-ui-preview-root";
  const BRIDGE="http://127.0.0.1:8765/quietchat/api";
  let poll=null;

  function bridge(path,payload){
    const body=JSON.stringify(payload||{});
    if(typeof GM_xmlhttpRequest==="function"){
      return new Promise((resolve,reject)=>{
        GM_xmlhttpRequest({
          method:"POST",
          url:BRIDGE+path,
          headers:{"Content-Type":"application/json"},
          data:body,
          timeout:8000,
          onload:r=>{
            let d={};
            try{d=JSON.parse(r.responseText||"{}");}catch{reject(new Error("bad bridge json"));return;}
            if(r.status>=400||d.status==="error"||d.status==="failed")reject(new Error(d.error||d.msg||("bridge "+r.status)));
            else resolve(d);
          },
          onerror:()=>reject(new Error("bridge offline")),
          ontimeout:()=>reject(new Error("bridge timeout"))
        });
      });
    }
    return fetch(BRIDGE+path,{method:"POST",headers:{"Content-Type":"application/json"},body})
      .then(async r=>{const d=await r.json().catch(()=>({error:"bad bridge json"}));if(!r.ok||d.status==="error"||d.status==="failed")throw new Error(d.error||d.msg||("bridge "+r.status));return d;});
  }

  function ui(){
    const h=document.getElementById(ROOT_ID),r=h&&h.shadowRoot;
    if(!r)return null;
    return {
      root:r,
      send:r.querySelector(".qc-send"),
      scan:r.querySelector('.qc-actions .qc-btn, button[aria-label="Scan"]'),
      status:r.querySelector(".qc-status-bar")
    };
  }

  function status(u,t){if(u&&u.status)u.status.textContent=t;}
  function lock(u,on){
    if(!u||!u.send)return;
    u.send.disabled=!!on;
    u.send.style.opacity=on?".45":"1";
    u.send.style.cursor=on?"not-allowed":"pointer";
  }

  async function scan(){
    const u=ui();
    if(!u)return;
    try{
      const d=await bridge("/scan",{chat_url:location.href,limit:80});
      const m=d.messages||[];
      const last=m[m.length-1];
      if(u.scan)u.scan.click();
      if(last&&["pending","running"].includes(last.state)){
        lock(u,true);
        status(u,`Resumed ${last.message_id||"QuietChat"} — waiting...`);
        startPoll();
        return;
      }
      lock(u,false);
      status(u,m.length?`Recovered ${m.length} QuietChat messages.`:"QuietChat ready.");
    }catch(e){
      lock(u,false);
      status(u,"Bridge offline. Start local bridge then press Scan.");
    }
  }

  function startPoll(){
    if(poll)clearInterval(poll);
    poll=setInterval(async()=>{
      const u=ui();
      if(!u)return;
      try{
        const d=await bridge("/scan",{chat_url:location.href,limit:80});
        const m=d.messages||[],last=m[m.length-1];
        if(u.scan)u.scan.click();
        if(last&&["completed","blocked","paused"].includes(last.state)){
          lock(u,false);
          status(u,"QuietChat updated.");
          clearInterval(poll);
          poll=null;
        }
      }catch(e){status(u,"Polling paused. Press Scan or restart bridge.");}
    },1500);
  }

  const ready=setInterval(()=>{
    const u=ui();
    if(!u||!u.status)return;
    clearInterval(ready);
    scan();
  },300);
})();