window.Suji=window.Suji||{}; window.Suji.core=window.Suji.core||{};
window.Suji.core.utils=Object.freeze({
 clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),
 padLevel:n=>String(n).padStart(4,'0'),
 mulberry32:a=>function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;},
 shuffle:(arr,rng)=>{arr=[...arr];for(let i=arr.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr;}
});
