let msgT="";
/* ========== HALAMAN PEMESANAN PELANGGAN ========== */
function viewOrder(){
document.title="Pesan Laundry Halal";
app.innerHTML=`<header class="top"><div class="brand">Laundry <span class="pk">Halal</span></div><p>Bersih Pakaiannya, Tenang Ibadahnya.</p></header>
<main class="wrap"><h1>Pesan laundry</h1>
<fieldset><legend>Pilih layanan</legend>
<label class="opt"><input type="radio" name="svc" value="reguler" checked><span><b>Laundry Reguler</b><small>Cuci, setrika, dan lipat</small></span><em data-p="reg">${rp(D.reg)}/kg</em></label>
<label class="opt"><input type="radio" name="svc" value="khusus"><span><b>Penanganan Khusus</b><small>Untuk pakaian terkena najis, dipisah dan disucikan sesuai SOP</small></span><em data-p="khu">${rp(D.khu)}/kg</em></label></fieldset>
<div class="hint" id="kh" hidden>Masukkan pakaian bernajis ke kantong khusus agar tidak tercampur dengan pakaian reguler.</div>
<label class="f">Nama<input type="text" id="n" autocomplete="name" placeholder="Nama lengkap"></label>
<label class="f">Nomor WhatsApp<input type="tel" id="w" autocomplete="tel" placeholder="08xxxxxxxxxx"></label>
<label class="f">Perkiraan berat (kg), boleh dikosongkan<input type="number" id="k" min="0" step="0.5" inputmode="decimal" placeholder="Contoh: 4"></label>
<fieldset><legend>Pengambilan</legend>
<label class="opt"><input type="radio" name="pk" value="sendiri" checked><span><b>Antar sendiri ke kios</b><small>${ADDR}</small></span></label>
<label class="opt"><input type="radio" name="pk" value="jemput"><span><b>Mohon dijemput</b><small>Kami ambil cucian ke alamat Anda</small></span></label></fieldset>
<label class="f" id="al" hidden>Alamat penjemputan<textarea id="a" placeholder="Alamat lengkap, patokan, atau titik lokasi"></textarea></label>
<label class="f">Catatan, boleh dikosongkan<textarea id="c" placeholder="Misalnya: sebagian pakaian terkena najis, atau minta cepat selesai"></textarea></label>
<button class="btn big" id="send" type="button" aria-disabled="true">Kirim pesanan</button>
<p class="note" id="msg">Pesanan langsung masuk ke admin. Berat final ditimbang di kios, lalu invoice kami kirim lewat WhatsApp. Buka 08.00–20.00 WIB.</p>
<p class="foot">${ADDR}</p></main>`;
const $=s=>app.querySelector(s),v=id=>$(id).value.trim(),r=n=>app.querySelector(`input[name=${n}]:checked`).value;
function upd(){
 if(!app.querySelector("#send"))return;
 const kh=r("svc")==="khusus",jm=r("pk")==="jemput";
 $("#kh").hidden=!kh;$("#al").hidden=!jm;
 const ok=v("#n")&&num(v("#w")).length>=10&&(!jm||v("#a"));
 msgT=["*PESANAN LAUNDRY HALAL*","Nama: "+v("#n"),"WhatsApp: "+v("#w"),"Layanan: "+(kh?"Penanganan Khusus (najis)":"Reguler (cuci + setrika)"),"Estimasi berat: "+(v("#k")?v("#k")+" kg":"-"),"Pengambilan: "+(jm?"Dijemput":"Antar sendiri"),"Alamat: "+(jm?v("#a").replace(/\n/g," "):"-"),"Catatan: "+(v("#c").replace(/\n/g," ")||"-")].join("\n");
 $("#send").setAttribute("aria-disabled",ok?"false":"true");
}
app.addEventListener("input",upd);app.addEventListener("change",upd);
$("#send").addEventListener("click",async e=>{
 const b=e.currentTarget;
 if(b.getAttribute("aria-disabled")==="true"){toast("Lengkapi nama, nomor WhatsApp, dan alamat jika minta dijemput.");return}
 b.setAttribute("aria-disabled","true");b.textContent="Mengirim…";
 try{
  const res=await fetch("/api/orders",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({nama:v("#n"),wa:v("#w"),svc:r("svc"),kg:v("#k"),jemput:r("pk")==="jemput",alamat:v("#a"),cat:v("#c")})});
  if(!res.ok)throw 0;
  const {id}=await res.json();
  app.querySelector("main").innerHTML=`<h1>Pesanan terkirim</h1><p>Nomor pesanan Anda <b>${id}</b>. Admin akan menghubungi Anda lewat WhatsApp untuk konfirmasi.</p><a class="btn wa big" target="_blank" rel="noopener" href="${wl(WA,msgT+"\nNo. pesanan: "+id)}">Konfirmasi via WhatsApp</a><p class="note"><a href="/">Buat pesanan lain</a></p>`;
 }catch(err){b.textContent="Kirim pesanan";b.setAttribute("aria-disabled","false");toast("Gagal mengirim. Coba lagi, atau hubungi kami lewat WhatsApp.")}
});
upd();
fetch("/api/settings").then(r=>r.json()).then(s=>{app.querySelectorAll("[data-p]").forEach(e=>e.textContent=rp(s[e.dataset.p])+"/kg")}).catch(()=>{});
}


viewOrder();
