'use strict';
const KEY='beer-inventory-v1';
const euro=cents=>(cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
let inventory=[], remaining={};
const $=id=>document.getElementById(id);
const status=message=>{$('status').textContent=message};
// =================================================================================================
// INVENTORY VALIDATION AND SAVED COUNTS
// =================================================================================================
function validateInventory(items) {
 // ------------------------------------------
 // Validate product fields and unique IDs
 const identifiers = new Set();
 if (!Array.isArray(items) || items.length === 0) throw Error('Inventory must be a non-empty array');
 for (const item of items) {
  if (!item || !Number.isSafeInteger(item.id) || item.id < 1 || identifiers.has(item.id)) {
   throw Error('Inventory IDs must be unique positive integers');
  }
  if (typeof item.name !== 'string' || !item.name.trim()) throw Error('Product names must not be empty');
  if (!Number.isSafeInteger(item.initial) || item.initial < 0) throw Error('Invalid initial quantity');
  if (!Number.isSafeInteger(item.priceCents) || item.priceCents < 0) throw Error('Invalid unit price');
  identifiers.add(item.id);
 }
 return items;
}

function normalizeCounts(counts) {
 // ------------------------------------------
 // Preserve known quantities and initialize new products
 if (!counts || typeof counts !== 'object' || Array.isArray(counts)) throw Error('Invalid quantities');
 const normalized = {};
 for (const item of inventory) {
  const exists = Object.prototype.hasOwnProperty.call(counts, item.id);
  const count = exists ? counts[item.id] : item.initial;
  if (!Number.isSafeInteger(count) || count < 0) throw Error('Invalid product quantity');
  normalized[item.id] = Math.min(count, item.initial);
 }
 return normalized;
}

function save(){try{localStorage.setItem(KEY,JSON.stringify(remaining));status('Changes saved on this device.');return true}catch(e){status('Local storage unavailable: export a JSON backup to preserve changes.');return false}}
function render(){
 let consumed=0,total=0,spent=0,restValue=0;
 const list=$('list');list.replaceChildren();
 for(const item of inventory){
  const left=remaining[item.id],used=item.initial-left;
  total+=item.initial;consumed+=used;spent+=used*item.priceCents;restValue+=left*item.priceCents;
  const card=document.createElement('article');card.className='card';
  const info=document.createElement('div');
  const name=document.createElement('div');name.className='name';name.textContent=item.name;
  const details=document.createElement('div');details.className='details';details.textContent=`${euro(item.priceCents)} / unité · ${used} bue(s) · ${euro(used*item.priceCents)}`;
  info.append(name,details);
  const ctrl=document.createElement('div');ctrl.className='controls';
  const minus=document.createElement('button');minus.textContent='−';minus.setAttribute('aria-label',`Une ${item.name} restante en moins`);minus.disabled=left===0;
  const num=document.createElement('span');num.className='count';num.textContent=left;
  const plus=document.createElement('button');plus.textContent='+';plus.setAttribute('aria-label',`Une ${item.name} restante en plus`);plus.disabled=left===item.initial;
  minus.onclick=()=>change(item.id,-1);plus.onclick=()=>change(item.id,1);
  ctrl.append(minus,num,plus);card.append(info,ctrl);list.append(card);
 }
 $('drunk').textContent=`${consumed} / ${total}`;$('left').textContent=total-consumed;
 $('spent').textContent=euro(spent);$('remaining').textContent=euro(restValue);$('footerTotal').textContent=euro(spent);
}
function change(id,delta){const item=inventory.find(x=>x.id===id);remaining[id]=Math.max(0,Math.min(item.initial,remaining[id]+delta));save();render()}
$('restore').onclick=()=>$('import').click();
$('export').onclick=()=>{
 const blob=new Blob([JSON.stringify({format:'beer-inventory-v1',exportedAt:new Date().toISOString(),remaining},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='inventaire-bieres-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status('Sauvegarde téléchargée. Déplace-la dans Proton Drive pour avoir une copie cloud.');
};
$('import').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 try{const parsed=JSON.parse(await file.text());if(parsed.format!=='beer-inventory-v1')throw Error('Unsupported backup format');
 const restored=normalizeCounts(parsed.remaining);
 if(confirm('Remplacer les quantités actuelles par celles de cette sauvegarde ?')){remaining=restored;const persisted=save();render();if(persisted)status('Backup restored and saved on this device.')}}catch(err){alert('Sauvegarde invalide : '+err.message)}finally{e.target.value=''}
};
$('reset').onclick=()=>{if(confirm('Remettre toutes les quantités au stock initial ?')){remaining=Object.fromEntries(inventory.map(x=>[x.id,x.initial]));save();render()}};
for(const id of ['export','import','restore','reset'])$(id).disabled=true;
(async()=>{try{
 const response=await fetch('./inventory.json',{cache:'no-store'});if(!response.ok)throw Error('Inventaire introuvable');
 inventory=validateInventory(await response.json());remaining=Object.fromEntries(inventory.map(x=>[x.id,x.initial]));
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved!==null)remaining=normalizeCounts(saved)}catch(e){}
 render();
 for(const id of ['export','import','restore','reset'])$(id).disabled=false;
 if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
}catch(e){status('Erreur de chargement : '+e.message)}})();
