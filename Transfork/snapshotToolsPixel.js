window.Transfork = window.Transfork || {};

(function () {
    "use strict";

    const api = window.Transfork;
    const offscreen = document.createElement("canvas");
    const offctx = offscreen.getContext("2d");
    const state = { active:false,target:null,drawable:null,canvas:null,snapshot:null,source:null,occluders:[],mode:"",rect:null,mx:0,my:0,dir:90,scale:[100,100],visible:true,finalScale:[100,100],finalDirection:90 };

    function getVM(){ return api.vm?.getVM?.() || window.vm || window.Scratch?.vm || null; }
    function getCanvas(){ return api.coords?.getStageCanvas?.() || document.querySelector("canvas"); }
    function getBox(){ return api.selectionBox?.getBox?.() || document.querySelector("#gandi-transform-box"); }
    function modeFrom(el){ const t=String(el?.textContent||"").trim(), c=getComputedStyle(el).cursor; if(t==="↻"||c==="grab"||c==="grabbing")return"rotate"; if(t==="↔"||c==="ew-resize")return"width"; if(t==="↕"||c==="ns-resize")return"height"; if(t==="◲"||c==="nwse-resize"||c==="nesw-resize")return"uniform"; return""; }
    function sourceFrom(snapshot){ return snapshot instanceof HTMLCanvasElement ? snapshot : snapshot?.querySelector?.("canvas,img") || null; }
    function signedScale(v,d){ return Math.sign(v||1)*Math.max(0.01,Math.abs(v)+d); }
    function setVisible(vm,target,visible){ const r=vm.runtime.renderer,d=r._allDrawables[target.drawableID]; if(typeof r.updateDrawableVisible==="function")r.updateDrawableVisible(target.drawableID,visible); else if(d)d._visible=visible; target.emitVisualChange?.(); vm.runtime.requestRedraw?.(); }

    function scanAlpha(canvas, origin){
        let data; try{ data=canvas.getContext("2d").getImageData(0,0,canvas.width,canvas.height).data; }catch(_){ return null; }
        let minX=canvas.width,minY=canvas.height,maxX=-1,maxY=-1;
        for(let y=0;y<canvas.height;y++)for(let x=0;x<canvas.width;x++){ if(data[(y*canvas.width+x)*4+3]<=5)continue; if(x<minX)minX=x; if(y<minY)minY=y; if(x>maxX)maxX=x; if(y>maxY)maxY=y; }
        if(maxX<minX||maxY<minY)return null;
        return {left:origin.left+minX,top:origin.top+minY,width:maxX-minX+1,height:maxY-minY+1};
    }

    function trimSource(source){
        if(source instanceof HTMLImageElement && !source.complete)return null;
        const w=source.naturalWidth||source.width,h=source.naturalHeight||source.height; if(!w||!h)return null;
        const temp=document.createElement("canvas"); temp.width=w; temp.height=h; temp.getContext("2d").drawImage(source,0,0,w,h);
        const b=scanAlpha(temp,{left:0,top:0}); if(!b)return temp;
        const tight=document.createElement("canvas"); tight.width=Math.max(1,Math.ceil(b.width)); tight.height=Math.max(1,Math.ceil(b.height));
        tight.getContext("2d").drawImage(temp,b.left,b.top,b.width,b.height,0,0,b.width,b.height);
        return tight;
    }

    function placeBox(rect){ const box=getBox(); if(!box||!rect)return; box.style.display="block"; box.style.left=rect.left+"px"; box.style.top=rect.top+"px"; box.style.width=rect.width+"px"; box.style.height=rect.height+"px"; api.overlayTop?.bringBoxToTop?.(); }
    function applyVisibleTransform(sx,sy,rot){ if(!state.snapshot)return; state.snapshot.style.visibility="visible"; state.snapshot.style.transform="scale("+sx+","+sy+") rotate("+rot+"deg)"; state.snapshot.style.transformOrigin="50% 50%"; }

    function scanTransform(sx,sy,rot){
        const s=state.source,b=state.rect; if(!s||!b)return null;
        const rad=rot*Math.PI/180, sw=s.width*Math.abs(sx), sh=s.height*Math.abs(sy);
        const w=Math.max(1,Math.ceil(Math.abs(sw*Math.cos(rad))+Math.abs(sh*Math.sin(rad)))+4), h=Math.max(1,Math.ceil(Math.abs(sw*Math.sin(rad))+Math.abs(sh*Math.cos(rad)))+4);
        const cx=b.left+b.width/2, cy=b.top+b.height/2, left=cx-w/2, top=cy-h/2;
        offscreen.width=w; offscreen.height=h; offctx.setTransform(1,0,0,1,0,0); offctx.clearRect(0,0,w,h); offctx.translate(w/2,h/2); offctx.rotate(rad); offctx.scale(sx,sy); offctx.drawImage(s,-s.width/2,-s.height/2,s.width,s.height);
        return scanAlpha(offscreen,{left,top}) || {left,top,width:w,height:h};
    }

    function compute(event){
        const dx=event.clientX-state.mx, dy=event.clientY-state.my; let sx=1,sy=1,rot=0;
        if(state.mode==="width"){ const next=signedScale(state.scale[0],dx); sx=Math.abs(next)/Math.max(0.01,Math.abs(state.scale[0])); state.finalScale=[next,state.scale[1]]; }
        else if(state.mode==="height"){ const next=signedScale(state.scale[1],dy); sy=Math.abs(next)/Math.max(0.01,Math.abs(state.scale[1])); state.finalScale=[state.scale[0],next]; }
        else if(state.mode==="uniform"){ const r=Math.max(0.01,Math.abs(state.scale[0])+dx)/Math.max(0.01,Math.abs(state.scale[0])); sx=r; sy=r; state.finalScale=[state.scale[0]*r,state.scale[1]*r]; }
        else if(state.mode==="rotate"){ const r=getBox()?.getBoundingClientRect()||state.rect,cx=r.left+r.width/2,cy=r.top+r.height/2; rot=(Math.atan2(event.clientY-cy,event.clientX-cx)-Math.atan2(state.my-cy,state.mx-cx))*180/Math.PI; state.finalDirection=state.dir+rot; state.finalScale=state.scale.slice(); }
        return {sx,sy,rot};
    }

    function apply(event){ if(!state.active)return; const t=compute(event); applyVisibleTransform(t.sx,t.sy,t.rot); placeBox(scanTransform(t.sx,t.sy,t.rot)); }

    function start(event,mode){
        const vm=getVM(),canvas=getCanvas(); if(!vm?.runtime?.renderer||!canvas||!api.snapshotLayer)return false;
        const target=vm.editingTarget; if(!target||target.isStage)return false; const drawable=vm.runtime.renderer._allDrawables[target.drawableID]; if(!drawable?.getAABB)return false;
        const rect=api.pixelBounds?.rect?.(vm,target,drawable,canvas)||api.snapshotLayer.screenRect(drawable.getAABB(),canvas,vm); const snapshot=api.snapshotLayer.makeSnapshot(vm,target,drawable,canvas,rect,9998); const source=trimSource(sourceFrom(snapshot)); if(!snapshot||!source)return false;
        Object.assign(state,{active:true,target,drawable,canvas,snapshot,source,occluders:api.snapshotLayer.createOccluders(vm,target,canvas),mode,rect,mx:event.clientX,my:event.clientY,dir:target.direction||90,scale:drawable.scale?drawable.scale.slice():[100,100],visible:drawable._visible!==false,finalScale:drawable.scale?drawable.scale.slice():[100,100],finalDirection:target.direction||90});
        window.__transforkTransformActive=true; setVisible(vm,target,false); applyVisibleTransform(1,1,0); placeBox(scanTransform(1,1,0)); requestAnimationFrame(()=>requestAnimationFrame(()=>api.snapshotLayer.setVisible([snapshot].concat(state.occluders),true)));
        event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation(); return true;
    }

    function finish(commit){ if(!state.active)return; const vm=getVM(),target=state.target,drawable=state.drawable,nodes=[state.snapshot].concat(state.occluders||[]); if(commit&&vm&&target&&drawable){ if(state.mode==="rotate")target.setDirection(state.finalDirection); drawable.updateScale(state.finalScale); target.emitVisualChange?.(); vm.runtime.requestRedraw?.(); } if(vm&&target)setVisible(vm,target,state.visible); nodes.forEach(n=>n?.parentNode&&n.remove()); Object.assign(state,{active:false,target:null,drawable:null,canvas:null,snapshot:null,source:null,occluders:[]}); window.__transforkTransformActive=false; }

    window.addEventListener("mousedown",e=>{ if(e.button!==0||state.active)return; const box=getBox(); if(!box||!box.contains(e.target))return; const m=modeFrom(e.target); if(m)start(e,m); },true);
    window.addEventListener("mousemove",e=>{ if(state.active){ apply(e); e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }},true);
    window.addEventListener("mouseup",e=>{ if(state.active){ apply(e); finish(true); e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }},true);
    window.addEventListener("keydown",e=>{ if(e.key==="Escape"&&state.active){ finish(false); e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation(); }},true);
    window.addEventListener("blur",()=>finish(false),true);
    api.registerModule260705_NS8Q2M("snapshotToolsPixel",{state,start,finish,apply});
})();
