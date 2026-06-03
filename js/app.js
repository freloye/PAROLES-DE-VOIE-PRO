const PASSWORD = 'MELEC';
function unlock(id){
  const input=document.getElementById(id+'-pass'); const box=document.getElementById(id+'-locked'); const content=document.getElementById(id+'-content'); const msg=document.getElementById(id+'-msg');
  if(!input||!box||!content) return;
  if((input.value||'').trim().toUpperCase()===PASSWORD){box.classList.add('hidden'); content.classList.remove('hidden'); sessionStorage.setItem('pvpro-'+id,'1'); setTimeout(initSrtPlayers,80);}
  else if(msg){msg.textContent='Mot de passe incorrect.';}
}
function restoreLock(id){ if(sessionStorage.getItem('pvpro-'+id)==='1'){ const box=document.getElementById(id+'-locked'); const content=document.getElementById(id+'-content'); if(box&&content){box.classList.add('hidden');content.classList.remove('hidden');}}}
function playAudio(id){const a=document.getElementById(id); if(!a)return; a.play().catch(()=>{const s=document.getElementById(id+'-status'); if(s)s.textContent='Lecture bloquée : utilisez le lecteur ou le lien MP3 direct.';});}
function checkAudio(id){const a=document.getElementById(id); const s=document.getElementById(id+'-status'); if(!a||!s)return; a.addEventListener('canplaythrough',()=>s.textContent='Audio chargé.'); a.addEventListener('error',()=>s.textContent='Audio indisponible : utilisez le lien direct ou vérifiez le fichier.'); setTimeout(()=>{if(a.readyState<2)s.textContent='Audio en attente : cliquez sur le lecteur ou ouvrez le MP3 directement.'},1800);}

function srtTimeToSeconds(t){
  const m=(t||'').trim().match(/(\d+):(\d+):(\d+)[,.](\d+)/); if(!m) return 0;
  return (+m[1])*3600+(+m[2])*60+(+m[3])+(+m[4])/1000;
}
function parseSrt(text){
  return text.replace(/\r/g,'').split(/\n\s*\n/).map(block=>{
    const lines=block.split('\n').filter(Boolean);
    const timeLine=lines.find(l=>l.includes('-->'));
    if(!timeLine) return null;
    const [start,end]=timeLine.split('-->').map(x=>x.trim());
    const textLines=lines.slice(lines.indexOf(timeLine)+1).join('\n').trim();
    return {start:srtTimeToSeconds(start),end:srtTimeToSeconds(end),text:textLines};
  }).filter(x=>x&&x.text);
}
async function attachSrt(audio){
  if(audio.dataset.srtReady==='1') return;
  audio.dataset.srtReady='1';
  const id=audio.id; const box=document.getElementById(id+'-lyrics'); const url=audio.dataset.srt;
  if(!box||!url) return;
  try{
    const res=await fetch(url,{cache:'no-store'});
    if(!res.ok) throw new Error('SRT absent');
    const cues=parseSrt(await res.text());
    if(!cues.length) throw new Error('SRT vide');
    box.classList.add('waiting'); box.textContent='Cliquez sur lecture : les paroles apparaîtront ici.';
    audio.addEventListener('timeupdate',()=>{
      const t=audio.currentTime; const cue=cues.find(c=>t>=c.start && t<=c.end);
      if(cue){box.classList.remove('waiting','missing'); box.textContent=cue.text;}
    });
  }catch(e){box.classList.add('missing'); box.textContent='Paroles synchronisées indisponibles. Utilisez le texte PDF.';}
}
function initSrtPlayers(){
  document.querySelectorAll('audio[id][data-srt]').forEach(attachSrt);
  document.querySelectorAll('audio[id]').forEach(a=>{
    const stage=a.closest('.audio-stage'); if(!stage || a.dataset.spinReady==='1') return;
    a.dataset.spinReady='1';
    a.addEventListener('play',()=>stage.classList.add('playing'));
    a.addEventListener('pause',()=>stage.classList.remove('playing'));
    a.addEventListener('ended',()=>stage.classList.remove('playing'));
  });
}

function initSituationViewer(){
  const img=document.getElementById('viewer-img'); if(!img) return;
  const params=new URLSearchParams(location.search);
  const type=params.get('type')==='remplies'?'remplies':'vierges';
  let n=parseInt(params.get('n')||'0',10); if(Number.isNaN(n)) n=0; n=Math.max(0,Math.min(15,n));
  const from=params.get('from')||'';
  const suffix=type==='remplies'?'remplie':'vierge';
  const file=`${type}/situation-${String(n).padStart(2,'0')}-${suffix}.png`;
  const src=file;
  const back= type==='remplies' || from==='remplies' ? '../support/situations-remplies.html' : '../angle-mort/#situations';
  img.src=src; img.alt=`Situation ${String(n).padStart(2,'0')} ${suffix}`;
  const title=document.getElementById('viewer-title'); if(title) title.textContent=`Situation ${String(n).padStart(2,'0')}`;
  const sub=document.getElementById('viewer-subtitle'); if(sub) sub.textContent= type==='remplies' ? 'Planche remplie — accès enseignant.' : 'Planche vierge.';
  const badge=document.getElementById('viewer-badge'); if(badge) badge.textContent= type==='remplies' ? 'Situation remplie' : 'Situation vierge';
  ['viewer-back','viewer-back-bottom','viewer-return-top'].forEach(id=>{const a=document.getElementById(id); if(a)a.href=back;});
  const direct=document.getElementById('viewer-direct'); if(direct) direct.href=src;
  const down=document.getElementById('viewer-download'); if(down) down.href=src;
  const prevN=Math.max(0,n-1), nextN=Math.min(15,n+1);
  const prevHref=`viewer.html?type=${type}&n=${String(prevN).padStart(2,'0')}&from=${from||type}`;
  const nextHref=`viewer.html?type=${type}&n=${String(nextN).padStart(2,'0')}&from=${from||type}`;
  ['viewer-prev','viewer-prev-side'].forEach(id=>{const a=document.getElementById(id); if(a){ if(id.includes('side')) a.onclick=()=>{location.href=prevHref}; else a.href=prevHref; a.style.visibility=n===0?'hidden':'visible';}});
  ['viewer-next','viewer-next-side'].forEach(id=>{const a=document.getElementById(id); if(a){ if(id.includes('side')) a.onclick=()=>{location.href=nextHref}; else a.href=nextHref; a.style.visibility=n===15?'hidden':'visible';}});
  document.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'&&n>0) location.href=prevHref; if(e.key==='ArrowRight'&&n<15) location.href=nextHref; if(e.key==='Escape') location.href=back;});
}

window.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('audio[id]').forEach(a=>checkAudio(a.id)); restoreLock('systeme'); restoreLock('remplies'); initSrtPlayers(); initSituationViewer();});
