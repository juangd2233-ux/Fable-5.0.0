(() => {
"use strict";
const $=id=>document.getElementById(id);
const TARGET_FPS=30;
const FRAME_INTERVAL=1000/TARGET_FPS;
let lastFrame=0;
function frameLimiter(timestamp){
  requestAnimationFrame(frameLimiter);
  if(timestamp-lastFrame<FRAME_INTERVAL)return;
  lastFrame=timestamp-(timestamp%FRAME_INTERVAL);
  document.documentElement.dataset.targetFps=String(TARGET_FPS);
}
requestAnimationFrame(frameLimiter);
const defaults={coins:0,ore:0,power:1,auto:0,pickLevel:0};
let data={...defaults};
const pickPrice=()=>Math.floor(25*Math.pow(1.65,data.pickLevel));
const autoPrice=()=>Math.floor(100*Math.pow(1.8,data.auto));
const fmt=n=>Math.floor(n).toLocaleString("es-CO");
function save(){try{localStorage.setItem("fable-mining-save",JSON.stringify(data));}catch(e){}}
function load(){try{const saved=JSON.parse(localStorage.getItem("fable-mining-save")||"null");if(saved)data={...defaults,...saved};}catch(e){}}
function render(){
$("coins").textContent=fmt(data.coins);$("ore").textContent=fmt(data.ore);$("power").textContent=fmt(data.power);
$("pickCost").textContent="Coste: "+fmt(pickPrice());$("autoCost").textContent="Coste: "+fmt(autoPrice());
$("pick").disabled=data.coins<pickPrice();$("auto").disabled=data.coins<autoPrice();
$("zone").textContent=data.ore>=1000?"Zona 2 · Caverna profunda":"Zona 1 · Mina inicial";
$("level").textContent="Pico nivel "+(data.pickLevel+1);
}
function mine(){data.ore+=data.power;$("progress").style.width=(data.ore%100)+"%";$("message").textContent="+"+fmt(data.power)+" minerales extraídos";render();save();const rock=$("rock");rock.animate([{transform:"scale(1)"},{transform:"scale(.97)"},{transform:"scale(1)"}],{duration:130});}
$("rock").addEventListener("click",mine);
$("pick").addEventListener("click",()=>{const cost=pickPrice();if(data.coins<cost)return;data.coins-=cost;data.pickLevel++;data.power++;$("message").textContent="Pico mejorado. Ahora extraes más.";render();save();});
$("auto").addEventListener("click",()=>{const cost=autoPrice();if(data.coins<cost)return;data.coins-=cost;data.auto++;$("message").textContent="Minero automático comprado.";render();save();});
$("sell").addEventListener("click",()=>{if(data.ore<10){$("message").textContent="Necesitas al menos 10 minerales.";return;}const amount=Math.floor(data.ore/10);data.ore-=amount*10;data.coins+=amount*5;$("message").textContent="Vendiste "+fmt(amount*10)+" minerales por "+fmt(amount*5)+" monedas.";render();save();});
$("reset").addEventListener("click",()=>{if(confirm("¿Borrar todo el progreso de Fable?")){data={...defaults};save();render();$("message").textContent="Partida reiniciada."; }});
load();render();
setInterval(()=>{if(data.auto>0){data.ore+=data.auto;render();save();}},1000);
})();