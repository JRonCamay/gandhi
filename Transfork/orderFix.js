window.Transfork = window.Transfork || {};
(function(){
"use strict";
const api=window.Transfork;
function list(vm){const r=vm&&vm.runtime&&vm.runtime.renderer;return Array.isArray(r&&r._drawList)?r._drawList:[];}
function z(vm,t,f){const i=list(vm).indexOf(t&&t.drawableID);return String(i<0?f:9000+i);}
function start(){
 if(!api.snapshotLayer||api.snapshotLayer.__orderFix260706_OF2M8Q)return;
 const old=api.snapshotLayer.makeSnapshot;
 if(typeof old!=="function")return;
 api.snapshotLayer.makeSnapshot=function(vm,t,d,c,r,zi){
  const n=old.call(this,vm,t,d,c,r,zi);
  if(n)n.style.zIndex=z(vm,t,zi||9998);
  return n;
 };
 api.snapshotLayer.__orderFix260706_OF2M8Q=true;
}
start();
api.registerModule260705_NS8Q2M("orderFix",{start});
})();