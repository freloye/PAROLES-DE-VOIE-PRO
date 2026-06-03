const PASSWORD = 'MELEC';
function unlock(id){
  const input=document.getElementById(id+'-pass'); const box=document.getElementById(id+'-locked'); const content=document.getElementById(id+'-content'); const msg=document.getElementById(id+'-msg');
  if(!input||!box||!content) return;
  if((input.value||'').trim().toUpperCase()===PASSWORD){box.classList.add('hidden'); content.classList.remove('hidden'); sessionStorage.setItem('pvpro-'+id,'1');}
  else if(msg){msg.textContent='Mot de passe incorrect.';}
}
function restoreLock(id){ if(sessionStorage.getItem('pvpro-'+id)==='1'){ const box=document.getElementById(id+'-locked'); const content=document.getElementById(id+'-content'); if(box&&content){box.classList.add('hidden');content.classList.remove('hidden');}}}
function playAudio(id){const a=document.getElementById(id); if(!a)return; a.play().catch(()=>{const s=document.getElementById(id+'-status'); if(s)s.textContent='Lecture bloquée : utilisez le lecteur ou le lien MP3 direct.';});}
function checkAudio(id){const a=document.getElementById(id); const s=document.getElementById(id+'-status'); if(!a||!s)return; a.addEventListener('canplaythrough',()=>s.textContent='Audio chargé.'); a.addEventListener('error',()=>s.textContent='Audio indisponible : utilisez le lien direct ou vérifiez le fichier.'); setTimeout(()=>{if(a.readyState<2)s.textContent='Audio en attente : cliquez sur le lecteur ou ouvrez le MP3 directement.'},1800);}
window.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('audio[id]').forEach(a=>checkAudio(a.id)); restoreLock('systeme'); restoreLock('remplies');});
