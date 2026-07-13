// ==UserScript==
// @name         QuietChat Lite
// @namespace    https://chatgpt.com/
// @version      0.3.19
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
  const ID="qc-lite-root",API="http://127.0.0.1:8765/quietchat/api",DAEMON="http://127.0.0.1:8766",POS="qc-lite-pos-v1",VER="0.3.19";
  let busy=false,timer=null,pos=0,last=[],win=10,init=false,toNewest=false,rendering=false,jump=false,st=null,findText="",findMid="",tipOpen=false,findScroll=false;
  const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
  function req(path,payload){
    const body=JSON.stringify(payload||{});
    if(typeof GM_xmlhttpRequest==="function")return new Promise((ok,fail)=>GM_xmlhttpRequest({method:"POST",url:API+path,headers:{"Content-Type":"application/json"},data:body,timeout:12000,onload:r=>{try{const d=JSON.parse(r.responseText||"{}");if(r.status>=400||d.status==="error")fail(new Error(d.msg||d.error||"bridge error"));else ok(d);}catch(e){fail(e);}},onerror:()=>fail(new Error("bridge offline")),ontimeout:()=>fail(new Error("bridge timeout"))}));
    return fetch(API+path,{method:"POST",headers:{"Content-Type":"application/json"},body}).then(r=>r.json());
  }
  function dop(op,params){
    const body=JSON.stringify({op,params:params||{}});
    if(typeof GM_xmlhttpRequest==="function")return new Promise((ok,fail)=>GM_xmlhttpRequest({method:"POST",url:DAEMON+"/op",headers:{"Content-Type":"application/json"},data:body,timeout:12000,onload:r=>{try{const d=JSON.parse(r.responseText||"{}");if(r.status>=400||d.status==="error")fail(new Error(d.msg||d.error||"daemon error"));else ok(d.result||d);}catch(e){fail(e);}},onerror:()=>fail(new Error("daemon offline")),ontimeout:()=>fail(new Error("daemon timeout"))}));
    return fetch(DAEMON+"/op",{method:"POST",headers:{"Content-Type":"application/json"},body}).then(r=>r.json()).then(d=>d.result||d);
  }
  async function view(){
    try{return (await req("/view",{cmd:"qc.view",params:{chatUrl:location.href,limit:500,scanLimit:500,staleAfter:120}})).result;}
    catch(e){const d=await req("/scan",{chat_url:location.href,limit:500});return {messages:d.messages||[],hiddenRecords:0,latestState:(d.messages||[]).at(-1)?.state};}
  }
  function boot(){
    if(document.getElementById(ID))return;
    const h=document.createElement("div");h.id=ID;h.innerHTML=`
      <style>
        #${ID}{position:fixed;right:24px;bottom:24px;z-index:2147483646;font:13px system-ui;color:#eee}
        #${ID} *{box-sizing:border-box}
        .qcw{position:relative;width:min(760px,calc(100vw - 48px));height:min(680px,calc(100vh - 80px));display:flex;flex-direction:column;background:#282828;border:1px solid #555;border-radius:16px;box-shadow:0 20px 70px #0009;overflow:hidden}
        .qcw.min{width:180px;height:48px}.qcw.min .qcb,.qcw.min .stat,.qcw.min .qcf{display:none}.qcw.min .qch{border:0}.qcw.min .qcs,.qcw.min .scan,.qcw.min .srch{display:none}
        .qch{height:48px;display:flex;align-items:center;gap:8px;padding:0 12px;background:#303030;border-bottom:1px solid #444;cursor:grab;user-select:none}
        .qch.drag{cursor:grabbing}
        .qct{font-weight:700;flex:1}.qcs{font-size:11px;color:#aaa}
        #${ID} button{border:1px solid #555;background:#3a3a3a;color:#eee;border-radius:9px;padding:7px 10px;cursor:pointer}#${ID} button:disabled{opacity:.45;cursor:not-allowed}
        .qca{position:relative;flex:1;min-height:0;background:#242424;overflow:hidden}.qcb{position:absolute;inset:0 18px 0 0;overflow:auto;scrollbar-width:none;padding:18px 18px 104px;background:#242424}.qcb::-webkit-scrollbar{display:none}.qbar{position:absolute;right:5px;top:10px;bottom:10px;width:10px;border-radius:999px;background:#1d1d1d;border:1px solid #3f3f3f;z-index:9}.qthumb{position:absolute;left:1px;right:1px;top:0;min-height:108px;border-radius:999px;background:#777;border:1px solid #9a9a9a;box-shadow:0 2px 8px #0008;cursor:grab}.qthumb:active{cursor:grabbing;background:#8d8d8d}.msg{max-width:88%;margin:0 0 14px;line-height:1.45;white-space:pre-wrap}.u{margin-left:auto;background:#3c3c3c;padding:10px 12px;border-radius:14px 14px 4px 14px}.a{margin-right:auto}.a:before{content:"QuietChat";display:block;color:#8fd;opacity:.8;font-size:11px;margin-bottom:4px}.pinrow{max-width:88%;margin:-8px 0 14px;display:flex;align-items:center;gap:7px;color:#9ee8d0;font-size:11px}.pinrow.pu{margin-left:auto;justify-content:flex-end}.pinrow.pa{margin-right:auto}.pinrow .pname{max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;border:1px solid #3b7769;background:#1f3f36;border-radius:8px;padding:4px 7px}.pinb{font-size:11px!important;padding:4px 7px!important;border-radius:8px!important;background:#263f39!important;border-color:#3b7769!important;color:#bfffee!important}.pinb.on{background:#bfffee!important;border-color:#7af0cf!important;color:#17352e!important}
        .qcf{display:flex;gap:8px;padding:12px;background:#303030;border-top:1px solid #444}#${ID} textarea{flex:1;min-height:42px;max-height:150px;resize:vertical;background:#3a3a3a;color:#eee;border:1px solid #555;border-radius:12px;padding:10px;outline:none}.stat{padding:6px 12px;text-align:center;color:#aaa;font-size:11px;background:#303030;border-top:1px solid #444}.vspacer{height:0;pointer-events:none}
        .newest{position:absolute;left:50%;bottom:6px;transform:translateX(-50%);width:38px;height:38px;border-radius:999px!important;font-size:18px;z-index:10;display:none;box-shadow:0 6px 18px #000a;background:#2f8f7a!important;border-color:#47c7a7!important}
        .qsp{position:absolute;inset:0;background:#0007;display:none;align-items:center;justify-content:center;z-index:20}.qsp.on{display:flex}.qspn{width:min(644px,calc(100% - 28px));height:min(506px,calc(100% - 40px));background:#292929;border:1px solid #666;border-radius:14px;box-shadow:0 18px 60px #000c;display:flex;flex-direction:column;overflow:hidden}.qsph{display:flex;gap:8px;padding:10px;background:#333;border-bottom:1px solid #444}#${ID} .qsph input{flex:1;background:#202020;color:#eee;border:1px solid #555;border-radius:9px;padding:9px;outline:none}.qspr{flex:1;overflow:auto;padding:10px;color:#bbb}.qspr .hint{font-size:12px;color:#999}.qleg{position:sticky;top:-10px;z-index:2;background:#292929;border-bottom:1px solid #444;font-size:11px;color:#aaa;padding:8px 4px 9px}.dot{display:inline-block;width:9px;height:9px;border-radius:99px;margin:0 4px 0 10px}.du{background:#263f66}.da{background:#3d3d3d}.dp{background:#285c4e}.res{padding:9px 10px;margin:0 0 7px;border:1px solid #3d3d3d;border-radius:10px;white-space:normal;overflow:hidden;cursor:pointer;line-height:1.35}.res.user{background:#24344d;border-color:#31537d}.res.assistant{background:#333}.res.summary{background:#3a3324;border-color:#6d5b2c}.res.pin,.res.pin_user,.res.pin_assistant{background:#1f3f36;border-color:#3b8d78;color:#d8fff5}.res:hover{filter:brightness(1.12)}.res mark,.msg mark,.pinrow mark{background:#2f8f7a;color:#fff;border-radius:4px;padding:0 2px}.qtt{position:fixed;z-index:2147483647;max-width:560px;max-height:360px;overflow:auto;scrollbar-width:none;background:#171717;color:#ddd;border:1px solid #666;border-radius:10px;padding:10px 12px;box-shadow:0 12px 40px #000d;font:12px/1.45 system-ui;white-space:pre-wrap;display:none;pointer-events:none}.qtt::-webkit-scrollbar{display:none}
      </style>
      <section class=qcw><div class=qch><div><div class=qct>QuietChat Lite <span style="font-size:10px;color:#999">v${VER}</span></div><div class=qcs>daemon view · 10 sliding</div></div><button class=scan>Scan</button><button class=srch title="Search by Pin or Words" aria-label="Search by Pin or Words">⌕</button><button class=hide>Dock</button></div><div class=qca><main class=qcb></main><div class=qbar title="Drag to move through QuietChat"><div class=qthumb></div></div><button class=newest title="Newest">↓</button></div><div class=stat>ready</div><footer class=qcf><textarea placeholder="Message QuietChat..."></textarea><button class=send>Send</button></footer><div class=qsp><div class=qspn><div class=qsph><input placeholder="Search pin or words..."><button class=sx title="Close">×</button></div><div class=qspr><div class=hint>Search panel ready. Results next.</div></div></div></div><div class=qtt></div></section>`;
    document.documentElement.appendChild(h);
    place(h);
    drag(h);
    h.querySelector(".scan").onclick=()=>jumpNewest();
    h.querySelector(".newest").onclick=()=>jumpNewest();
    h.querySelector(".srch").onclick=()=>openSearch(h);
    h.querySelector(".sx").onclick=()=>closeSearch(h);
    h.querySelector(".qsp").onclick=e=>{if(e.target.classList.contains("qsp"))closeSearch(h);};
    h.querySelector(".qsph input").oninput=()=>{clearTimeout(st);st=setTimeout(()=>runSearch(h),250);};
    h.querySelector(".qsph input").onkeydown=e=>{if(e.key==="Escape")closeSearch(h);if(e.key==="Enter"){clearTimeout(st);runSearch(h);}};
    h.querySelector(".hide").onclick=()=>{const w=h.querySelector(".qcw"),b=h.querySelector(".hide");w.classList.toggle("min");b.textContent=w.classList.contains("min")?"Open":"Dock";};
    h.querySelector(".send").onclick=send;
    document.addEventListener("keydown",e=>{const t=h.querySelector(".qtt");if(!tipOpen||t.style.display==="none")return;const k=e.key;if(!["ArrowDown","ArrowUp","PageDown","PageUp"].includes(k))return;e.preventDefault();t.scrollTop+=k==="ArrowDown"?36:k==="ArrowUp"?-36:k==="PageDown"?180:-180;});
    load();
    wireFakeScroll(h);
    h.querySelector(".qcb").onscroll=()=>updateNewest();
    h.querySelector(".qcb").onwheel=e=>{const b=e.currentTarget,max=Math.max(0,last.length-win);if(rendering||last.length<=win)return;if(e.deltaY<0&&b.scrollTop<32&&pos>0){e.preventDefault();pos-=1;render({messages:last,hiddenRecords:0},"top");}else if(e.deltaY>0&&b.scrollTop+b.clientHeight>=b.scrollHeight-32&&pos<max){e.preventDefault();pos+=1;render({messages:last,hiddenRecords:0},"bottom");}};
    timer=setInterval(()=>{const b=h.querySelector(".qcb"),atBottom=b&&b.scrollTop+b.clientHeight>=b.scrollHeight-24;if(pos>=Math.max(0,last.length-win)&&atBottom)load(false);},5000);
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
  function hi(s,q){s=String(s||"");q=String(q||"");const l=s.toLowerCase(),x=l.indexOf(q.toLowerCase());return x<0?esc(s):esc(s.slice(0,x))+"<mark>"+esc(s.slice(x,x+q.length))+"</mark>"+esc(s.slice(x+q.length));}
  function jumpNewest(){toNewest=true;jump=true;load(true);}
  function jumpMsg(id,q){const n=last.findIndex(x=>x.message_id===id);if(n<0){stat("message not in loaded window cache");return;}findMid=id;findText=q||"";findScroll=true;pos=Math.max(0,Math.min(n-4,Math.max(0,last.length-win)));jump=false;render({messages:last});closeSearch(document.getElementById(ID));}
  function openSearch(h){const p=h.querySelector(".qsp"),i=h.querySelector(".qsph input");p.classList.add("on");setTimeout(()=>i.focus(),30);}
  function closeSearch(h){h.querySelector(".qsp").classList.remove("on");}
  function tip(h,on,e,txt,q){const t=h.querySelector(".qtt");tipOpen=!!on;if(!on){t.style.display="none";return;}t.innerHTML=hi(txt||"",q);t.style.display="block";t.style.left=Math.min(innerWidth-580,e.clientX+16)+"px";t.style.top=Math.min(innerHeight-390,e.clientY+16)+"px";}
  function pinRow(r,hit,side){
    const id=esc(r.message_id||""),pn=side==="u"?(r.pin_user||r.pin_name||""):(r.pin_assistant||""),cls=side==="u"?"pu":"pa",sd=side==="u"?"user":"assistant";
    return `<div class="pinrow ${cls}" data-mid="${id}">${pn?`<span class=pname data-mid="${id}" data-side="${sd}" data-pin="${esc(pn)}" title="Edit pin name">📌 ${hit?hi(pn,findText):esc(pn)}</span>`:""}<button class="pinb ${pn?"on":""}" data-mid="${id}" data-side="${sd}" data-pin="${esc(pn)}" title="${pn?"Pinned":"Pin"}">${pn?"Pinned":"Pin"}</button></div>`;
  }
  function wirePinRow(row){
    row.querySelectorAll(".pinb").forEach(b=>b.onclick=()=>togglePin(b,b.dataset.mid,b.dataset.side,b.dataset.pin||""));
    row.querySelectorAll(".pname").forEach(b=>b.onclick=()=>editPin(b,b.dataset.mid,b.dataset.side,b.dataset.pin||""));
  }
  function paintPin(btn,id,side,name){
    const row=btn.closest(".pinrow");if(!row)return;
    const old=row.querySelector(".pname");if(old)old.remove();
    btn.dataset.pin=name||"";btn.classList.toggle("on",!!name);btn.textContent=name?"Pinned":"Pin";btn.title=name?"Pinned":"Pin";
    if(name){
      const s=document.createElement("span");s.className="pname";s.dataset.mid=id;s.dataset.side=side;s.dataset.pin=name;s.title="Edit pin name";s.textContent="📌 "+name;row.insertBefore(s,btn);s.onclick=()=>editPin(s,id,side,name);
    }
  }
  async function runSearch(h){
    const i=h.querySelector(".qsph input"),r=h.querySelector(".qspr"),q=i.value.trim();
    if(!q){r.innerHTML='<div class=hint>Type to search all QuietChat history.</div>';return;}
    r.innerHTML='<div class=hint>Searching daemon...</div>';
    try{
      const d=await dop("qc.search",{chatUrl:location.href,query:q,limit:50}),a=d.results||[];
      r.innerHTML=a.length?`<div class=qleg><span class="dot dp"></span>green = pin <span class="dot du"></span>blue = user <span class="dot da"></span>gray = assistant <span class="dot" style="background:#6d5b2c"></span>amber = summary</div>`+a.map((x,n)=>`<div class="res ${esc(x.role||"")}" data-i="${n}" data-mid="${esc(x.message_id||"")}" title="click to jump">${hi(x.snippet||"",q)}</div>`).join(""):`<div class=hint>No matches for "${esc(q)}".</div>`;
      r.querySelectorAll(".res[data-mid]").forEach(e=>e.onclick=()=>jumpMsg(e.dataset.mid,q));
      r.querySelectorAll(".res[data-i]").forEach(e=>{const x=a[+e.dataset.i];e.onmouseenter=v=>tip(h,true,v,x.preview||x.snippet||"",q);e.onmousemove=v=>tip(h,true,v,x.preview||x.snippet||"",q);e.onwheel=v=>{h.querySelector(".qtt").scrollTop+=v.deltaY;v.preventDefault();};e.onmouseleave=()=>tip(h,false);});
    }catch(e){r.innerHTML=`<div class=hint>Search failed: ${esc(e.message)}</div>`;}
  }
  function updateNewest(){
    const box=document.querySelector(`#${ID} .qcb`),nb=document.querySelector(`#${ID} .newest`);
    if(!box||!nb)return;
    const max=Math.max(0,last.length-win),atBottom=box.scrollTop+box.clientHeight>=box.scrollHeight-24;
    nb.style.display=(pos<max||!atBottom)?"block":"none";
  }
  function scrollBottom(box){box.scrollTop=box.scrollHeight;setTimeout(()=>{box.scrollTop=box.scrollHeight;},0);setTimeout(()=>{box.scrollTop=box.scrollHeight;},80);}
  function updateBar(force=false){
    const h=document.getElementById(ID),bar=h?.querySelector(".qbar"),th=h?.querySelector(".qthumb");
    if(!bar||!th)return;
    const max=Math.max(0,last.length-win),bh=bar.clientHeight;
    bar.style.display=last.length>win?"block":"none";
    if(last.length<=win||bh<20)return;
    const hh=Math.max(108,Math.min(bh-12,Math.round(bh*.95)));
    th.style.height=hh+"px";
    if(!force&&th.dataset.free==="1")return;
    th.style.top=(max?Math.round((bh-hh)*pos/max):0)+"px";
  }
  function wireFakeScroll(h){
    const bar=h.querySelector(".qbar"),th=h.querySelector(".qthumb");let drag=false,dy=0,edge=0,edgeTimer=null;
    const stopEdge=()=>{edge=0;if(edgeTimer){clearInterval(edgeTimer);edgeTimer=null;}};
    const bumpEdge=()=>{
      if(!drag||!edge)return;
      const box=h.querySelector(".qcb"),max=Math.max(0,last.length-win),step=58;
      if(edge<0&&box.scrollTop>2){box.scrollTop=Math.max(0,box.scrollTop-step);return;}
      if(edge>0&&box.scrollTop+box.clientHeight<box.scrollHeight-3){box.scrollTop=Math.min(box.scrollHeight,box.scrollTop+step);return;}
      const np=Math.max(0,Math.min(max,pos+edge));
      if(np===pos)return;
      pos=np;render({messages:last},edge<0?"edgeTop":"edgeBottom");
    };
    const checkEdge=y=>{
      const r=bar.getBoundingClientRect(),tr=th.getBoundingClientRect(),pad=4;
      edge=tr.top<=r.top+pad?-1:tr.bottom>=r.bottom-pad?1:0;
      if(edge&&!edgeTimer){bumpEdge();edgeTimer=setInterval(bumpEdge,140);}
      if(!edge)stopEdge();
    };
    const moveThumb=y=>{
      const r=bar.getBoundingClientRect(),hh=th.offsetHeight,span=Math.max(0,r.height-hh);
      th.style.top=Math.max(0,Math.min(span,y-dy-r.top))+"px";
    };
    th.onpointerdown=e=>{drag=true;th.dataset.free="1";dy=e.clientY-th.getBoundingClientRect().top;th.setPointerCapture(e.pointerId);moveThumb(e.clientY);checkEdge(e.clientY);e.preventDefault();};
    th.onpointermove=e=>{if(!drag)return;moveThumb(e.clientY);checkEdge(e.clientY);};
    th.onpointerup=e=>{drag=false;stopEdge();try{th.releasePointerCapture(e.pointerId);}catch{};};
    th.onpointercancel=()=>{drag=false;stopEdge();};
  }
  function render(d,shift=""){
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
      const hit=r.message_id===findMid;
      if(r.user_message){
        box.insertAdjacentHTML("beforeend",`<div class="msg u" data-mid="${esc(r.message_id||"")}">${hit?hi(r.user_message,findText):esc(r.user_message)}</div>`);
        box.insertAdjacentHTML("beforeend",pinRow(r,hit,"u"));
      }
      box.insertAdjacentHTML("beforeend",`<div class="msg a" data-mid="${esc(r.message_id||"")}">${hit?hi(r.assistant_reply||statusText(r),findText):esc(r.assistant_reply||statusText(r))}</div>`);
      box.insertAdjacentHTML("beforeend",pinRow(r,hit,"a"));
    }
    box.querySelectorAll(".pinrow").forEach(wirePinRow);
    if(jump||first)scrollBottom(box);
    else if(shift==="top")box.scrollTop=2;
    else if(shift==="bottom")box.scrollTop=2;
    else if(shift==="edgeTop")box.scrollTop=box.scrollHeight;
    else if(shift==="edgeBottom")box.scrollTop=2;
    else if(shift==="bar")box.scrollTop=2;
    else if(findMid&&findScroll){findScroll=false;setTimeout(()=>box.querySelector(`[data-mid="${CSS.escape(findMid)}"] mark`)?.scrollIntoView({block:"center"}),30);}
    jump=false;
    setTimeout(()=>{rendering=false;},120);
    const locked=["pending","running"].includes((all.at(-1)||{}).state);
    lock(locked);
    updateBar();
    updateNewest();
    stat(`${m.length} shown · window ${pos+1}-${Math.min(pos+win,all.length)} of ${all.length} · ${(all.at(-1)||{}).state||"ready"}`);
  }
  function statusText(r){const l=(r.status_log||[]).at(-1);return `[${r.state||"pending"}] ${(l&&l.note)||"Waiting for reply."}`;}
  async function savePin(el,id,side,name,msg){
    try{
      await dop("qc.pin",{chatUrl:location.href,msgId:id,side,pinName:name});
      const r=last.find(x=>x.message_id===id);
      if(r){const k=side==="assistant"?"pin_assistant":"pin_user";if(name)r[k]=name;else delete r[k];}
      const btn=el.classList.contains("pinb")?el:el.closest(".pinrow")?.querySelector(".pinb");
      if(btn)paintPin(btn,id,side,name);
      stat(msg);
    }catch(e){stat("pin failed: "+e.message);}
  }
  async function togglePin(el,id,side,cur){
    if(cur)return savePin(el,id,side,"","pin removed");
    const name=prompt("Pin name for this message:","");
    if(name===null)return;
    if(name.trim())return savePin(el,id,side,name.trim(),"pin saved");
  }
  async function editPin(el,id,side,cur){
    const name=prompt("Edit pin name:",cur||"");
    if(name===null)return;
    return savePin(el,id,side,name.trim(),name.trim()?"pin saved":"pin removed");
  }
  async function load(opt=false){
    const o=typeof opt==="object"&&opt?opt:{jump:!!opt},box=document.querySelector(`#${ID} .qcb`),keep=box?box.scrollTop:null,keepPos=pos;
    try{
      if(o.jump)jump=true;
      render(await view());
      if(o.preserve&&keep!==null){
        pos=keepPos;render({messages:last});
        setTimeout(()=>{const b=document.querySelector(`#${ID} .qcb`);if(b)b.scrollTop=keep;},0);
        setTimeout(()=>{const b=document.querySelector(`#${ID} .qcb`);if(b)b.scrollTop=keep;},80);
      }
    }catch(e){stat("bridge offline: "+e.message);lock(false);}
  }
  function goNewest(){toNewest=true;jump=true;render({messages:last});}
  async function send(){
    if(busy)return;
    const ta=document.querySelector(`#${ID} textarea`),txt=ta.value.trim();
    if(!txt)return;
    lock(true);stat("creating...");
    try{
      const d=await req("/create",{chat_url:location.href,conversation_title:document.title||"ChatGPT",user_message:txt,metadata:{source:"qc-lite",url:location.href}});
      ta.value="";await load(true);goNewest();sendToChat(d.trigger||`Use quietchat_process_message for ${d.message_id}.`);
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
