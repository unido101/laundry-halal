const WA="6285212281263",ADDR="Jl. Teguhan No. 3 (Bangjo Teguhan), Sragen";
const D={reg:6000,khu:8000,jem:0,bayar:"Pembayaran tunai di kios, atau transfer (isi rekening di Pengaturan)."};
const app=document.getElementById("app");
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const rp=n=>"Rp"+Math.round(n||0).toLocaleString("id-ID");
const num=p=>{p=String(p||"").replace(/\D/g,"");return p.startsWith("0")?"62"+p.slice(1):p.startsWith("8")?"62"+p:p};
const wl=(to,t)=>"https://wa.me/"+to+"?text="+encodeURIComponent(t);
let tt;function toast(m){const t=document.getElementById("toast");t.textContent=m;t.hidden=false;clearTimeout(tt);tt=setTimeout(()=>t.hidden=true,3200)}

