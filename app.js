'use strict';
const KEY='beer-inventory-v1';
const euro=cents=>(cents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'});
let inventory=[], remaining={};
const $=id=>document.getElementById(id);
const status=message=>{$('status').textContent=message};
function validCounts(obj){return obj&&typeof obj==='object'&&inventory.every(x=>Number.isInteger(obj[x.id])&&obj[x.id]>=0&&obj[x.id]<=x.initial)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(remaining));status('Modifications enregistrées sur cet appareil.')}catch(e){status('Stockage local indisponible : exporte un JSON pour ne rien perdre.')}}
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
$('export').onclick=()=>{
 const blob=new Blob([JSON.stringify({format:'beer-inventory-v1',exportedAt:new Date().toISOString(),remaining},null,2)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='inventaire-bieres-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 status('Sauvegarde téléchargée. Déplace-la dans Proton Drive pour avoir une copie cloud.');
};
$('import').onchange=async e=>{
 const file=e.target.files[0];if(!file)return;
 try{const parsed=JSON.parse(await file.text());if(parsed.format!=='beer-inventory-v1'||!validCounts(parsed.remaining))throw Error('Format ou quantités invalides');
 if(confirm('Remplacer les quantités actuelles par celles de cette sauvegarde ?')){remaining=parsed.remaining;save();render();status('Sauvegarde restaurée.')}}catch(err){alert('Sauvegarde invalide : '+err.message)}finally{e.target.value=''}
};
$('reset').onclick=()=>{if(confirm('Remettre toutes les quantités au stock initial ?')){remaining=Object.fromEntries(inventory.map(x=>[x.id,x.initial]));save();render()}};
(async()=>{try{
 const response=await fetch('./inventory.json');if(!response.ok)throw Error('Inventaire introuvable');
 inventory=await response.json();remaining=Object.fromEntries(inventory.map(x=>[x.id,x.initial]));
 try{const saved=JSON.parse(localStorage.getItem(KEY));if(validCounts(saved))remaining=saved}catch(e){}
 render();
 if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
}catch(e){status('Erreur de chargement : '+e.message)}})();
