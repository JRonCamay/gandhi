// ==UserScript==
// @name         QuietChat View Hotfix
// @namespace    https://chatgpt.com/
// @version      0.1.0
// @description  Force QuietChat scans to clipped qc.view.
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        GM_xmlhttpRequest
// @connect      127.0.0.1
// @connect      localhost
// @run-at       document-start
// ==/UserScript==

(function(){
  "use strict";
  if(window.__quietChatViewHotfixV1)return;
  window.__quietChatViewHotfixV1=true;
  const API="http://127.0.0.1:8765/quietchat/api";
  function norm(body){
    let p={};
    try{p=typeof body==="string"?JSON.parse(body||"{}"):body||{};}catch{}
    return {cmd:"qc.view",params:{chatUrl:p.chatUrl||p.chat_url||location.href,limit:20,scanLimit:80,staleAfter:120}};
  }
  function flat(d){
    const r=(d&&d.result)||d||{},m=r.messages||[];
    return {...r,status:"success",messages:m,count:r.visibleRecords||m.length,total:r.totalRecords||m.length,hidden:r.hiddenRecords||0};
  }
  function gmView(data,ok,fail){
    GM_xmlhttpRequest({method:"POST",url:API+"/view",headers:{"Content-Type":"application/json"},data:JSON.stringify(norm(data)),timeout:8000,
      onload:r=>{try{ok({status:r.status,responseText:JSON.stringify(flat(JSON.parse(r.responseText||"{}")))});}catch(e){fail&&fail(e);}},
      onerror:e=>fail&&fail(e),ontimeout:e=>fail&&fail(e)});
  }
  if(typeof GM_xmlhttpRequest==="function"&&!window.__qcOrigGMXHR){
    window.__qcOrigGMXHR=GM_xmlhttpRequest;
    window.GM_xmlhttpRequest=function(o){
      if(o&&String(o.url||"").startsWith(API+"/scan")){
        return gmView(o.data,o.onload,o.onerror);
      }
      return window.__qcOrigGMXHR(o);
    };
  }
  const of=window.fetch;
  window.fetch=function(input,init){
    const u=String(input&&input.url||input||"");
    if(u.startsWith(API+"/scan")){
      return of(API+"/view",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(norm(init&&init.body))})
        .then(async r=>new Response(JSON.stringify(flat(await r.json().catch(()=>({})))),{status:200,headers:{"Content-Type":"application/json"}}));
    }
    return of.apply(this,arguments);
  };
})();