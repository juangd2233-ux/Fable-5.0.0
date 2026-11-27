(()=>{"use strict";
const $=id=>document.getElementById(id);
const fmt=n=>Math.floor(n).toLocaleString("es-CO");
const SAVE_KEY="fable-mining-save";
const picks=[
{id:"wood_pickaxe",name:"Pico de madera",power:1,cost:0,icon:"🪵"},
{id:"stone_pickaxe",name:"Pico de piedra",power:2,cost:50,icon:"🪨"},
{id:"iron_pickaxe",name:"Pico de hierro",power:4,cost:250,icon:"⚒️"},
{id:"gold_pickaxe",name:"Pico de oro",power:7,cost:900,icon:"🟡"},
{id:"diamond_pickaxe",name:"Pico de diamante",power:12,cost:3500,icon:"💎"},
{id:"obsidian_pickaxe",name:"Pico de obsidiana",power:22,cost:12000,icon:"⬛"},
{id:"crystal_pickaxe",name:"Pico Fable",power:4000000000,cost:0,icon:"🔷"}];
const mobs=[
{id:"miner",name:"Minero",desc:"Extrae 1 mineral/s",rate:1,cost:100,icon:"👷"},
{id:"mole",name:"Topo minero",desc:"Extrae 3 minerales/s",rate:3,cost:450,icon:"🐾"},
{id:"cave_golem",name:"Gólem de cueva",desc:"Extrae 8 minerales/s",rate:8,cost:2200,icon:"🪨"},
{id:"crystal_sprite",name:"Duende de cristal",desc:"Extrae 20 minerales/s",rate:20,cost:10000,icon:"✨"}];
const fresh=()=>({coins:0,ore:0,pickId:"wood_pickaxe",ownedPicks:["wood_pickaxe"],mobCounts:{}});
let data=fresh();
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(data));}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem(SAVE_KEY)||"null");if(s&&typeof s==="object")data={...fresh(),...s,ownedPicks:Array.isArray(s.ownedPicks)?s.ownedPicks:["wood_pickaxe"],mobCounts:s.mobCounts&&typeof s.mobCounts==="object"?s.mobCounts:{}};}catch(e){data=fresh();}
if(!picks.some(p=>p.id===data.pickId))data.pickId="wood_pickaxe";
if(!data.ownedPicks.includes("wood_pickaxe"))data.ownedPicks.unshift("wood_pickaxe");}
const currentPick=()=>picks.find(p=>p.id===data.pickId)||picks[0];
const mobRate=()=>mobs.reduce((n,m)=>n+(Number(data.mobCounts[m.id])||0)*m.rate,0);
function say(t){$("message").textContent=t;}
function renderPicks(){$("pickaxeList").innerHTML=picks.map(p=>{const owned=data.ownedPicks.includes(p.id),active=data.pickId===p.id;return '<div class="upgrade"><div><b>'+p.icon+' '+p.name+'</b><small>Fuerza: '+p.power+' por golpe</small><span class="cost">'+(owned?(active?"Equipado":"Comprado"):"Precio: "+fmt(p.cost)+" monedas")+'</span></div><button data-pick="'+p.id+'" '+(active?"disabled":"")+'>'+(active?"Equipado":owned?"Equipar":"Comprar")+'</button></div>';}).join("");
$("pickaxeList").querySelectorAll("[data-pick]").forEach(b=>b.addEventListener("click",()=>buyPick(b.dataset.pick)));}
function renderMobs(){$("mobList").innerHTML=mobs.map(m=>{const n=Number(data.mobCounts[m.id])||0;return '<div class="upgrade"><div><b>'+m.icon+" "+m.name+' × '+n+'</b><small>'+m.desc+' por ayudante</small><span class="cost">Contratar: '+fmt(m.cost)+' monedas</span></div><button data-mob="'+m.id+'">Contratar</button></div>';}).join("");
$("mobList").querySelectorAll("[data-mob]").forEach(b=>b.addEventListener("click",()=>hireMob(b.dataset.mob)));}
function render(){$("coins").textContent=fmt(data.coins);$("ore").textContent=fmt(data.ore);$("power").textContent=fmt(currentPick().power);$("level").textContent=currentPick().name;$("zone").textContent=data.ore>=1000?"Zona 2 · Caverna profunda":"Zona 1 · Mina inicial";$("progress").style.width=(data.ore%100)+"%";renderPicks();renderMobs();}
function mine(){const amount=currentPick().power;data.ore+=amount;say("+"+fmt(amount)+" minerales. Pico: "+currentPick().name);render();save();if($("rock").animate)$("rock").animate([{transform:"scale(1)"},{transform:"scale(.97)"},{transform:"scale(1)"}],{duration:130});}
function buyPick(id){const p=picks.find(x=>x.id===id);if(!p)return;if(!data.ownedPicks.includes(id)){if(data.coins<p.cost){say("No tienes monedas suficientes para "+p.name);return;}data.coins-=p.cost;data.ownedPicks.push(id);}data.pickId=id;say("Pico equipado: "+p.name);render();save();}
function hireMob(id){const m=mobs.find(x=>x.id===id);if(!m)return;if(data.coins<m.cost){say("Te faltan monedas para contratar: "+m.name);return;}data.coins-=m.cost;data.mobCounts[id]=(Number(data.mobCounts[id])||0)+1;say("Contrataste "+m.name+". Producción: "+fmt(mobRate())+" minerales/s.");render();save();}
function sell(){if(data.ore<10){say("Necesitas al menos 10 minerales para vender.");return;}const bundles=Math.floor(data.ore/10),sold=bundles*10,earned=bundles*5;data.ore-=sold;data.coins+=earned;say("Vendiste "+fmt(sold)+" minerales por "+fmt(earned)+" monedas.");render();save();}
function runCommand(raw){const parts=raw.trim().split(/\s+/),cmd=(parts[0]||"").toLowerCase(),arg=(parts[1]||"").toLowerCase();let out="Comando desconocido. Escribe /help.";
switch(cmd){
case"/help":out="/help — lista comandos\n/balance — muestra monedas y minerales\n/sell — vende minerales\n/upgrade — equipa el pico más fuerte comprado\n/buy <id> — compra/equipa pico\n/hire <id> — contrata mob\n/mine — mina una vez";break;
case"/balance":out="Monedas: "+fmt(data.coins)+" | Minerales: "+fmt(data.ore);break;
case"/sell":sell();out=$("message").textContent;break;
case"/upgrade":{const best=picks.filter(p=>data.ownedPicks.includes(p.id)).sort((a,b)=>b.power-a.power)[0];data.pickId=best.id;render();save();out="Pico equipado: "+best.name;break;}
case"/mine":mine();out="Minerales actuales: "+fmt(data.ore);break;
case"/buy":{const p=picks.find(p=>p.id===arg);if(!p)out="IDs: "+picks.map(p=>p.id).join(", ");else{buyPick(p.id);out=$("message").textContent;}break;}
case"/hire":{const m=mobs.find(m=>m.id===arg);if(!m)out="IDs: "+mobs.map(m=>m.id).join(", ");else{hireMob(m.id);out=$("message").textContent;}break;}
default:out="No existe "+cmd+". Escribe /help.";
}$("commandOutput").textContent=out;}
$("rock").addEventListener("click",mine);
$("sell").addEventListener("click",sell);
$("runCommand").addEventListener("click",()=>runCommand($("commandInput").value));
$("commandInput").addEventListener("keydown",e=>{if(e.key==="Enter")runCommand($("commandInput").value);});
$("reset").addEventListener("click",()=>{if(confirm("¿Borrar todo el progreso de Fable?")){data=fresh();save();render();say("Partida reiniciada.");}});
load();render();
setInterval(()=>{const rate=mobRate();if(rate>0){data.ore+=rate;render();save();}},1000);
})();