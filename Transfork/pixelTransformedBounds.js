window.Transfork=window.Transfork||{};
(function(){
"use strict";
const api=window.Transfork;
function norm(src){
 if(!src)return null;
 if(src instanceof HTMLCanvasElement)return src.width&&src.height?src:null;
 if(typeof ImageBitmap!=="undefined"&&src instanceof ImageBitmap){let c=document.createElement("canvas");c.width=src.width;c.height=src.height;c.getContext("2d").drawImage(src,0,0);return c;}
 if(typeof ImageData!=="undefined"&&src instanceof ImageData){let c=document.createElement("canvas");c.width=src.width;c.height=src.height;c.getContext("2d").putImageData(src,0,0);return c;}
 if(src.imageData)return norm(src.imageData);
 if(src.data&&src.width&&src.height)return norm(new ImageData(new Uint8ClampedArray(src.data),src.width,src.height));
 return null;
}
function scan(c){
 if(!c)return null;let d;
 try{d=c.getContext("2d").getImageData(0,0,c.width,c.height).data;}catch(e){return null;}
 let minX=c.width,minY=c.height,maxX=-1,maxY=-1;
 for(let y=0;y<c.height;y++)for(let x=0;x<c.width;x++){let a=d[(y*c.width+x)*4+3];if(a<8)continue;if(x<minX)minX=x;if(y<minY)minY=y;if(x>maxX)maxX=x;if(y>maxY)maxY=y;}
 if(maxX<minX||maxY<minY)return null;
 return{minX,minY,maxX,maxY,w:c.width,h:c.height};
}
function screenPoint(vm,canvas,x,y){let n=vm.runtime.renderer.getNativeSize(),r=canvas.getBoundingClientRect();return{x:r.left+((x+n[0]/2)/n[0])*r.width,y:r.top+((n[1]/2-y)/n[1])*r.height};}
function rectFromPoints(p){let xs=p.map(q=>q.x),ys=p.map(q=>q.y),l=Math.min(...xs),t=Math.min(...ys),r=Math.max(...xs),b=Math.max(...ys);return{left:l,top:t,width:r-l,height:b-t};}
function extractDrawable(vm,target){let r=vm.runtime.renderer;if(typeof r.extractDrawable!=="function")return null;try{return norm(r.extractDrawable(target.drawableID));}catch(e){return null;}}
function transformedRect(vm,target,drawable,canvas){
 let source=extractDrawable(vm,target),s=scan(source);if(!s)return null;
 let costume=target?.sprite?.costumes?.[target.currentCostume],size=costume?.size||[s.w,s.h];
 let rcx=typeof costume?.rotationCenterX==="number"?costume.rotationCenterX:size[0]/2;
 let rcy=typeof costume?.rotationCenterY==="number"?costume.rotationCenterY:size[1]/2;
 let scale=drawable?.scale||[target.size||100,target.size||100];
 let rad=((typeof target.direction==="number"?target.direction:90)-90)*Math.PI/180,co=Math.cos(rad),si=Math.sin(rad),pad=1;
 let minX=Math.max(0,s.minX-pad),minY=Math.max(0,s.minY-pad),maxX=Math.min(s.w-1,s.maxX+pad),maxY=Math.min(s.h-1,s.maxY+pad);
 let pts=[[minX,minY],[maxX+1,minY],[maxX+1,maxY+1],[minX,maxY+1]].map(p=>{
  let cx=p[0]/s.w*size[0],cy=p[1]/s.h*size[1];
  let lx=(cx-rcx)*scale[0]/100,ly=(rcy-cy)*scale[1]/100;
  return screenPoint(vm,canvas,target.x+lx*co-ly*si,target.y+lx*si+ly*co);
 });
 return rectFromPoints(pts);
}
function patch(){
 if(!api.pixelBounds||api.pixelBounds.__transformedPatch)return;
 let old=api.pixelBounds.rect;
 api.pixelBounds.rect=function(vm,target,drawable,canvas){return transformedRect(vm,target,drawable,canvas)||old?.(vm,target,drawable,canvas)||null;};
 api.pixelBounds.__transformedPatch=true;
}
patch();
api.registerModule260705_NS8Q2M("pixelTransformedBounds",{patch,transformedRect});
})();