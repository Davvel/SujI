/** SuJi Module: pwa/install — service-worker registration and install prompt workflow. */
import {STORAGE_KEYS} from '../../config/storage-keys.js';
export function initPWA(){
  if ('serviceWorker' in navigator) window.addEventListener('load',()=>{ navigator.serviceWorker.register('./sw.js').catch(err=>console.warn('SuJi service worker registration failed:',err)); },{once:true});
  const promptEl=document.getElementById('pwaInstallPrompt'), installBtn=document.getElementById('pwaInstallBtn'), dismissBtn=document.getElementById('pwaInstallDismiss'), titleEl=document.getElementById('pwaInstallTitle'), textEl=document.getElementById('pwaInstallText');
  if(!promptEl||!installBtn||!dismissBtn) return;
  const standalone=()=>window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  const isiOS=/iphone|ipad|ipod/i.test(navigator.userAgent); let deferredInstallPrompt=null;
  const showPrompt=()=>{ if(standalone()||sessionStorage.getItem(STORAGE_KEYS.pwaInstallDismissed)==='1') return; promptEl.hidden=false; };
  const hidePrompt=()=>{ promptEl.hidden=true; };
  window.addEventListener('beforeinstallprompt',event=>{ event.preventDefault(); deferredInstallPrompt=event; promptEl.classList.remove('is-ios'); titleEl.textContent='Install SuJi'; textEl.textContent='Add SuJi to your Home Screen and play it like a normal app.'; showPrompt(); });
  installBtn.addEventListener('click',async()=>{ if(!deferredInstallPrompt)return; hidePrompt(); deferredInstallPrompt.prompt(); try{await deferredInstallPrompt.userChoice;}catch(_){} deferredInstallPrompt=null; });
  dismissBtn.addEventListener('click',()=>{ hidePrompt(); try{sessionStorage.setItem(STORAGE_KEYS.pwaInstallDismissed,'1');}catch(_){} });
  window.addEventListener('appinstalled',()=>{ deferredInstallPrompt=null; hidePrompt(); try{sessionStorage.removeItem(STORAGE_KEYS.pwaInstallDismissed);}catch(_){} });
  if(isiOS&&!standalone()){ promptEl.classList.add('is-ios'); titleEl.textContent='Install SuJi'; textEl.textContent='Tap Share, then “Add to Home Screen” to install SuJi.'; window.setTimeout(showPrompt,1400); }
}
