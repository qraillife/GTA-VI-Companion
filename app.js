'use strict';
const RELEASE={year:2026,month:11,day:19};
const preferredZones=[['Australia/Brisbane','Brisbane / Queensland (AEST)'],['Australia/Sydney','Sydney / Melbourne (AEDT)'],['Australia/Adelaide','Adelaide (ACDT)'],['Australia/Perth','Perth (AWST)'],['Australia/Darwin','Darwin (ACST)'],['Pacific/Auckland','Auckland (NZDT)'],['Pacific/Fiji','Fiji'],['Asia/Tokyo','Tokyo'],['Asia/Singapore','Singapore'],['Asia/Dubai','Dubai'],['Europe/London','London'],['Europe/Paris','Paris'],['America/New_York','New York'],['America/Chicago','Chicago'],['America/Denver','Denver'],['America/Los_Angeles','Los Angeles'],['America/Toronto','Toronto'],['America/Sao_Paulo','São Paulo'],['Africa/Johannesburg','Johannesburg'],['UTC','UTC']];
const $=id=>document.getElementById(id);
const pad=n=>String(n).padStart(2,'0');
function safeGet(k){try{return localStorage.getItem(k)}catch{return null}}
function safeSet(k,v){try{localStorage.setItem(k,v)}catch{}}
function validZone(z){try{new Intl.DateTimeFormat('en-US',{timeZone:z});return true}catch{return false}}
function deviceZone(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Australia/Brisbane'}catch{return 'Australia/Brisbane'}}
function makeZoneList(){const sel=$('timezone');let zones=[];try{zones=Intl.supportedValuesOf('timeZone')}catch{zones=preferredZones.map(z=>z[0])}const seen=new Set();const add=(v,label)=>{if(!validZone(v)||seen.has(v))return;seen.add(v);const o=document.createElement('option');o.value=v;o.textContent=label;sel.append(o)};for(const [zone,label] of preferredZones)add(zone,label);for(const z of zones)add(z,z.replaceAll('_',' ').replaceAll('/',' / '));const device=deviceZone(),stored=safeGet('vi-timezone');add(device,`${device} (device)`);sel.value=validZone(stored)?stored:device;if(!sel.value)sel.value='Australia/Brisbane'}
// Converts midnight in a named IANA timezone to an absolute epoch, accounting for fractional offsets and DST.
function localParts(epoch,zone){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'}).formatToParts(new Date(epoch));return Object.fromEntries(parts.filter(p=>p.type!=='literal').map(p=>[p.type,Number(p.value)]))}
function zonedMidnightUTC(zone){const desired=Date.UTC(RELEASE.year,RELEASE.month-1,RELEASE.day);let candidate=desired;for(let i=0;i<5;i++){const p=localParts(candidate,zone);const observed=Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second);const diff=desired-observed;candidate+=diff;if(Math.abs(diff)<1000)break}return candidate}
function fmtInZone(date,zone,options){return new Intl.DateTimeFormat('en-AU',{timeZone:zone,...options}).format(date)}
let countdownTarget=0;
function updateZone(){const zone=$('timezone').value;if(!validZone(zone))return;safeSet('vi-timezone',zone);countdownTarget=zonedMidnightUTC(zone);const date=new Date(countdownTarget);$('releaseAt').textContent='Release: '+fmtInZone(date,zone,{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'numeric',minute:'2-digit',hour12:true,timeZoneName:'short'});$('zoneDetail').textContent='Selected: '+zone.replaceAll('_',' ')+' · Release at local midnight';tick()}
function tick(){const left=Math.max(0,countdownTarget-Date.now());const s=Math.floor(left/1000);$('days').textContent=pad(Math.floor(s/86400));$('hours').textContent=pad(Math.floor(s%86400/3600));$('minutes').textContent=pad(Math.floor(s%3600/60));$('seconds').textContent=pad(s%60);$('releaseStatus').textContent=left===0?'RELEASED':'19 NOV 2026';$('countTitle').textContent=left===0?'Welcome to Leonida!':'Until launch in your region';}
let toastTimer;function toast(t){const el=$('toast');el.textContent=t;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),3000)}
const items=[['Check your console region','Your store/account region may determine when the game unlocks.'],['Pre-order or purchase the game','Use an official PlayStation, Xbox or Rockstar storefront.'],['Start your pre-load','Eligible purchases can pre-load ahead of launch.'],['Check available storage','Check your console for the actual required space.'],['Update system software','Install available console updates ahead of launch.'],['Charge your controller','Get ready for midnight in your region.']];
function renderChecklist(){const saved=JSON.parse(safeGet('vi-checklist')||'{}');const root=$('checklist');root.replaceChildren();let done=0;items.forEach(([title,detail],i)=>{const checked=Boolean(saved[i]);if(checked)done++;const label=document.createElement('label');label.className='check-row';const box=document.createElement('input');box.type='checkbox';box.checked=checked;box.addEventListener('change',()=>{const state=JSON.parse(safeGet('vi-checklist')||'{}');state[i]=box.checked;safeSet('vi-checklist',JSON.stringify(state));renderChecklist()});const content=document.createElement('span');const strong=document.createElement('strong');strong.textContent=title;const small=document.createElement('small');small.textContent=detail;content.append(strong,small);label.append(box,content);root.append(label)});const header=document.querySelector('#launch .overline');header.textContent=`READY FOR MIDNIGHT? · ${done}/${items.length} COMPLETE`}
function initMedia(){
 const dialog=$('mediaViewer'),title=$('viewerTitle'),body=$('viewerBody');
 function close(){dialog.close();body.replaceChildren()}
 $('viewerClose').addEventListener('click',close);dialog.addEventListener('close',()=>body.replaceChildren());dialog.addEventListener('click',e=>{if(e.target===dialog)close()});
 // Local media is preferred. When absent, embedded official YouTube may require age checks.
 document.querySelectorAll('[data-video]').forEach(button=>button.addEventListener('click',()=>{
  title.textContent=button.dataset.title;body.replaceChildren();
  const local=button.dataset.localVideo;const age=button.dataset.ageRestricted==='true';
  const wrap=document.createElement('div');wrap.className='video-play-area';
  const status=document.createElement('p');status.className='muted';status.textContent='Loading video…';wrap.append(status);body.append(wrap);dialog.showModal();
  const launchEmbed=()=>{wrap.replaceChildren();if(age){const note=document.createElement('p');note.className='muted';note.textContent='This video may require verification by the official player. This app cannot bypass that requirement.';wrap.append(note)}
   const id=button.dataset.video;if(!/^[A-Za-z0-9_-]{11}$/.test(id)){toast('Video is unavailable');return}
   const frame=document.createElement('iframe');frame.src='https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&rel=0';frame.title=button.dataset.title;frame.allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';wrap.append(frame)};
  // Test if the locally included video exists; don't show a permanently blank player.
  fetch(local,{method:'HEAD'}).then(r=>{if(!r.ok||!(r.headers.get('content-type')||'').includes('video'))throw Error('missing');wrap.replaceChildren();const video=document.createElement('video');video.src=local;video.controls=true;video.playsInline=true;video.autoplay=true;video.style.width='100%';video.addEventListener('error',launchEmbed,{once:true});wrap.append(video);video.play().catch(()=>{});}).catch(launchEmbed);
 }));
 document.querySelectorAll('.shot').forEach(button=>button.addEventListener('click',()=>{const img=button.querySelector('img');title.textContent=button.dataset.caption;body.replaceChildren();const full=document.createElement('img');full.src=img.src;full.alt=img.alt;body.append(full);dialog.showModal()}));
}
function initPhotoFallbacks(){
 const fallback='assets/fallback-art.jpg';
 for(const img of document.querySelectorAll('img[data-optional-photo]')){
  img.addEventListener('error',function(){
   const remote=this.dataset.remoteSrc;
   if(remote&&!this.dataset.triedRemote){this.dataset.triedRemote='yes';this.src=remote;return}
   if(!this.dataset.triedFallback){this.dataset.triedFallback='yes';this.src=fallback;this.classList.add('fallback-photo');return}
   this.removeAttribute('src');this.alt='Image unavailable';
  });
  if(img.complete&&img.naturalWidth===0)img.dispatchEvent(new Event('error'));
 }
}
function init(){initMedia();initPhotoFallbacks();makeZoneList();$('timezone').addEventListener('change',updateZone);$('detectZone').addEventListener('click',()=>{const zone=deviceZone();if(![...$('timezone').options].some(o=>o.value===zone)){const o=new Option(zone,zone);$('timezone').add(o)}$('timezone').value=zone;updateZone();toast('Using your device timezone')});updateZone();setInterval(tick,1000);renderChecklist();$('resetChecklist').addEventListener('click',()=>{safeSet('vi-checklist','{}');renderChecklist();toast('Checklist reset')});$('shareCountdown').addEventListener('click',async()=>{const zone=$('timezone').value;const msg=`Grand Theft Auto VI launches at midnight on 19 November 2026 in ${zone}. Check the countdown: ${location.href.split('#')[0]}`;try{if(navigator.share)await navigator.share({title:'GTA VI Countdown',text:msg,url:location.href.split('#')[0]});else if(navigator.clipboard){await navigator.clipboard.writeText(msg);toast('Countdown copied')}else toast('Share is not supported in this browser')}catch(e){if(e.name!=='AbortError')toast('Unable to share')}});$('menuButton').addEventListener('click',()=>{const open=$('nav').classList.toggle('open');$('menuButton').setAttribute('aria-expanded',String(open))});document.querySelectorAll('#nav a').forEach(a=>a.addEventListener('click',()=>{$('nav').classList.remove('open');$('menuButton').setAttribute('aria-expanded','false')}));if('serviceWorker'in navigator&&location.protocol!=='file:')window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(()=>{}))}
document.addEventListener('DOMContentLoaded',init);
