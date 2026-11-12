/* ========== ADMIN ========== */
let S={orders:[],set:{...D}},pw=sessionStorage.getItem("lhpw")||"",tab="list",filt="aktif",editId=null,arm=null;
async function api(path,method="GET",body){
 const r=await fetch(path,{method,headers:{"Content-Type":"application/json",Authorization:"Bearer "+pw},body:body?JSON.stringify(body):undefined});
 if(r.status===401){const had=pw;pw="";sessionStorage.removeItem("lhpw");login(had?"Password salah.":"");throw new Error("401")}
 if(!r.ok)throw new Error(String(r.status));
 return r.json();
}
const put=o=>api("/api/orders","PUT",o).catch(()=>toast("Gagal menyimpan perubahan."));
async function load(){const[a,b]=await Promise.all([api("/api/orders"),api("/api/settings")]);S.orders=a.orders;S.set={...D,...b}}
const flow=o=>o.jemput?["Baru","Dijemput","Diproses","Selesai","Diantar"]:["Baru","Diproses","Selesai","Diambil"];
const nextSt=o=>flow(o)[flow(o).indexOf(o.status)+1];
const harga=o=>o.harga||(o.svc==="khusus"?S.set.khu:S.set.reg);
const total=o=>(o.kg||0)*harga(o)+(o.jemput?(o.biayaJemput||0):0);
const svcName=o=>o.svc==="khusus"?"Penanganan Khusus":"Reguler (cuci + setrika)";
const tgl=o=>new Date(o.ts).toLocaleDateString("id-ID",{day:"numeric",month:"long",year:"numeric"});
const hi=o=>"Halo kak "+o.nama+",\n\n";
const sign="\n\n_Laundry Halal, Bersih Pakaiannya, Tenang Ibadahnya._";
const fmt=x=>Math.round(x||0).toLocaleString("id-ID");
const WIB={timeZone:"Asia/Jakarta"};
const hari=ts=>new Date(ts).toLocaleDateString("id-ID",{...WIB,weekday:"long"});
const tglS=ts=>new Date(ts).toLocaleDateString("en-GB",{...WIB,day:"2-digit",month:"2-digit",year:"2-digit"});
const jam=ts=>new Date(ts).toLocaleTimeString("en-GB",{...WIB,hour:"2-digit",minute:"2-digit"});
const sapa=()=>{const h=+new Date().toLocaleString("en-GB",{...WIB,hour:"numeric",hour12:false});return h<11?"Selamat pagi":h<15?"Selamat siang":h<18?"Selamat sore":"Selamat malam"};
const LINE="=============================";
const EST="1–2 hari"; // estimasi selesai di struk, ubah sesuai kebutuhan

function mInvoice(o){
 const st=o.lunas?"Lunas":"Belum Lunas";
 return [
  "*Laundry Halal*",ADDR,"WhatsApp 0852-1228-1263",
  "Kode struk : "+o.id,
  "Terima : "+hari(o.ts)+", "+tglS(o.ts)+" "+jam(o.ts),
  "Est. selesai : "+EST,"",
  "Untuk Customer",o.nama.toUpperCase(),"Total "+st,fmt(total(o)),"",
  LINE,svcName(o),
  o.kg+" kg x "+fmt(harga(o))+" = "+fmt(o.kg*harga(o)),
  ...(o.jemput&&o.biayaJemput?["Biaya jemput = "+fmt(o.biayaJemput)]:[]),
  LINE,"Total : "+fmt(total(o)),"Status Bayar : "+st,LINE,
  ...(o.lunas?[]:[S.set.bayar,LINE]),
  "Mohon periksa kembali cucian Anda setelah selesai.",
  "==========Terima Kasih========="
 ].join("\n");
}

function mDone(o){
 return [
  sapa()+" kak "+o.nama,
  o.jemput?"Laundry sudah selesai dikerjakan dan akan kami antar ke alamat Anda. Terima kasih.":"Laundry sudah selesai dikerjakan dan bisa diambil. Terima kasih.",
  "","Kode : "+o.id,
  "Total : "+fmt(total(o))+" ("+(o.lunas?"Lunas":"Belum Lunas")+")",
  ...(o.jemput?[]:["Ambil di : "+ADDR+", 08.00–20.00 WIB"]),
  "","*Laundry Halal*","Bersih Pakaiannya, Tenang Ibadahnya."
 ].join("\n");
}
function mPick(o){return hi(o)+"Pesanan *"+o.id+"* sudah kami terima. Kami akan menjemput cucian di:\n"+o.alamat+"\n\nMohon siapkan cucian"+(o.svc==="khusus"?" dan pisahkan pakaian bernajis di kantong khusus":"")+". Terima kasih."+sign}

function card(o){
 const has=o.kg>0,to=num(o.wa),n=nextSt(o),fin=["Selesai","Diantar","Diambil"].includes(o.status);
 return `<article class="card"><div class="r"><b>${esc(o.id)}</b><span class="badge">${o.status}</span>${o.svc==="khusus"?'<span class="badge pk">Khusus</span>':""}${o.jemput?'<span class="badge">Jemput</span>':""}${o.lunas?'<span class="badge ok">Lunas</span>':""}</div>
<h3>${esc(o.nama)}<small>${esc(o.wa)}</small></h3>
<p class="m">${has?o.kg+" kg, "+rp(total(o)):"Berat belum ditimbang"+(o.est?" (estimasi "+o.est+" kg)":"")}${o.jemput?"<br>Jemput: "+esc(o.alamat):""}${o.cat?"<br>Catatan: "+esc(o.cat):""}</p>
<div class="acts">
${n?`<button class="sm" data-a="next" data-id="${o.id}">Lanjut: ${n}</button>`:""}
${o.jemput&&o.status==="Baru"?`<a class="btn sm wa" target="_blank" rel="noopener" href="${wl(to,mPick(o))}">WA jemput</a>`:""}
${has?`<a class="btn sm wa" target="_blank" rel="noopener" href="${wl(to,mInvoice(o))}">WA invoice</a>`:`<button class="sm alt" data-a="need">WA invoice</button>`}
${fin&&has?`<a class="btn sm wa" target="_blank" rel="noopener" href="${wl(to,mDone(o))}">WA selesai</a>`:""}
<button class="sm alt" data-a="pay" data-id="${o.id}">${o.lunas?"Batal lunas":"Tandai lunas"}</button>
<button class="sm alt" data-a="edit" data-id="${o.id}">Ubah</button>
<button class="sm del" data-a="del" data-id="${o.id}">${arm===o.id?"Yakin hapus?":"Hapus"}</button></div></article>`;
}

function viewAdmin(){
 document.title="Admin Laundry Halal";
 const O=[...S.orders].sort((a,b)=>b.ts-a.ts),cnt=s=>O.filter(o=>o.status===s).length;
 const done=o=>["Diantar","Diambil"].includes(o.status);
 let body="";
 if(tab==="list"||tab==="pick"){
  let L=tab==="pick"?O.filter(o=>o.jemput&&["Baru","Dijemput"].includes(o.status)):filt==="aktif"?O.filter(o=>!done(o)):filt==="siap"?O.filter(o=>o.status==="Selesai"):filt==="riwayat"?O.filter(done):O;
  const chips=tab==="list"?`<div class="chips">${[["aktif","Aktif"],["siap","Siap diambil"],["riwayat","Riwayat"],["semua","Semua"]].map(c=>`<button data-a="f" data-id="${c[0]}" ${filt===c[0]?'aria-current="true"':""}>${c[1]}</button>`).join("")}</div>`:`<p class="note" style="margin:0 0 12px">Daftar pesanan yang perlu dijemput.</p>`;
  body=`<div class="stats"><div class="stat"><b>${cnt("Baru")}</b><span>Pesanan baru</span></div><div class="stat"><b>${O.filter(o=>o.jemput&&["Baru","Dijemput"].includes(o.status)).length}</b><span>Perlu dijemput</span></div><div class="stat"><b>${cnt("Diproses")}</b><span>Sedang diproses</span></div><div class="stat"><b>${cnt("Selesai")}</b><span>Siap diambil/diantar</span></div></div>${chips}`+(L.length?`<div class="grid">${L.map(card).join("")}</div>`:`<div class="empty">Belum ada pesanan di sini.<br>Pesanan dari WhatsApp bisa ditempel lewat tab Pesanan baru.</div>`);
 }else if(tab==="form"){
  const o=S.orders.find(x=>x.id===editId)||{svc:"reguler",jemput:false};
  body=`<div class="panel"><h2>${editId?"Ubah "+editId:"Pesanan baru"}</h2>
  ${editId?"":`<label class="f">Tempel pesan WhatsApp dari pelanggan<textarea id="paste" placeholder="Tempel pesan dari halaman pemesanan di sini"></textarea></label><button class="alt sm" data-a="parse" type="button" style="margin-bottom:14px">Isi otomatis dari pesan</button>`}
  <label class="f">Nama<input type="text" id="n" value="${esc(o.nama)}"></label>
  <label class="f">Nomor WhatsApp<input type="tel" id="w" value="${esc(o.wa)}" placeholder="08xxxxxxxxxx"></label>
  <div class="row2"><label class="f">Layanan<select id="s"><option value="reguler" ${o.svc==="reguler"?"selected":""}>Reguler</option><option value="khusus" ${o.svc==="khusus"?"selected":""}>Penanganan Khusus</option></select></label>
  <label class="f">Berat (kg)<input type="number" id="k" step="0.1" min="0" inputmode="decimal" value="${o.kg||""}"></label></div>
  <label class="chk"><input type="checkbox" id="j" ${o.jemput?"checked":""}>Perlu dijemput</label>
  <label class="f">Alamat penjemputan<textarea id="a">${esc(o.alamat)}</textarea></label>
  <label class="f">Catatan<textarea id="c">${esc(o.cat)}</textarea></label>
  <div class="acts"><button data-a="saveo" type="button">Simpan</button><button class="alt" data-a="cancel" type="button">Batal</button></div></div>`;
 }else{
  const s=S.set;
  body=`<div class="panel"><h2>Pengaturan</h2>
  <div class="row2"><label class="f">Harga reguler (per kg)<input type="number" id="p1" value="${s.reg}"></label><label class="f">Harga khusus (per kg)<input type="number" id="p2" value="${s.khu}"></label></div>
  <label class="f">Biaya jemput (Rp, 0 jika gratis)<input type="number" id="p3" value="${s.jem}"></label>
  <label class="f">Info pembayaran di invoice<textarea id="p4">${esc(s.bayar)}</textarea></label>
  <button data-a="saves" type="button">Simpan pengaturan</button>
  <p class="note">Perubahan harga berlaku untuk pesanan baru. Harga di halaman pemesanan pelanggan terpisah, ubah lewat Claude.</p></div>`;
 }
 const T=[["list","Pesanan"],["pick","Jemputan"],["form","Pesanan baru"],["set","Pengaturan"]];
 app.innerHTML=`<header class="top"><div class="brand">Laundry <span class="pk">Halal</span></div><p>Admin <a href="/">Lihat halaman pesanan</a> <button class="alt sm" data-a="logout" type="button">Keluar</button></p></header>
 <main class="wrap adm">
 <nav class="tabs">${T.map(t=>`<button data-a="tab" data-id="${t[0]}" ${tab===t[0]?'aria-current="true"':""}>${t[1]}</button>`).join("")}</nav>${body}</main>`;
}

function parseWA(t){
 const m={};t.split(/\r?\n/).forEach(l=>{const x=l.match(/^\s*\*?\s*(Nama|WhatsApp|Layanan|Estimasi berat|Pengambilan|Alamat|Catatan)\s*\*?\s*:\s*(.*)$/i);if(x)m[x[1].toLowerCase()]=x[2].trim()});
 return m;
}
const val=id=>app.querySelector(id).value.trim();
app.addEventListener("click",async e=>{
 const b=e.target.closest("[data-a]");if(!b||!document.getElementById("app").contains(b))return;
 const a=b.dataset.a,id=b.dataset.id,o=S.orders.find(x=>x.id===id);
 if(a==="logout"){sessionStorage.removeItem("lhpw");pw="";login()}
 else if(a==="tab"){tab=id;editId=null;viewAdmin()}
 else if(a==="f"){filt=id;viewAdmin()}
 else if(a==="need")toast("Isi berat cucian dulu lewat tombol Ubah.");
 else if(a==="next"&&o){o.status=nextSt(o);await put(o);viewAdmin()}
 else if(a==="pay"&&o){o.lunas=!o.lunas;await put(o);viewAdmin()}
 else if(a==="edit"){editId=id;tab="form";viewAdmin()}
 else if(a==="del"){if(arm===id){S.orders=S.orders.filter(x=>x.id!==id);arm=null;await api("/api/orders?id="+id,"DELETE").catch(()=>toast("Gagal menghapus."))}else{arm=id;setTimeout(()=>{if(arm===id){arm=null;if(tab==="list"||tab==="pick")viewAdmin()}},3000)}viewAdmin()}
 else if(a==="cancel"){editId=null;tab="list";viewAdmin()}
 else if(a==="parse"){
  const m=parseWA(val("#paste"));if(!m.nama){toast("Format pesan tidak dikenali.");return}
  const set=(i,v)=>{if(v!=null)app.querySelector(i).value=v};
  set("#n",m.nama);set("#w",m.whatsapp);set("#s",/khusus/i.test(m.layanan||"")?"khusus":"reguler");
  const kg=parseFloat((m["estimasi berat"]||"").replace(",","."));if(kg)set("#k",kg);
  const j=/jemput/i.test(m.pengambilan||"")&&!/antar sendiri/i.test(m.pengambilan||"");app.querySelector("#j").checked=j;
  set("#a",m.alamat&&m.alamat!=="-"?m.alamat:"");set("#c",m.catatan&&m.catatan!=="-"?m.catatan:"");toast("Data terisi. Periksa lalu simpan.");
 }
 else if(a==="saveo"){
  if(!val("#n")||num(val("#w")).length<10){toast("Nama dan nomor WhatsApp wajib diisi.");return}
  if(val("#j")==="on"||app.querySelector("#j").checked){if(!val("#a")){toast("Isi alamat penjemputan.");return}}
  const j=app.querySelector("#j").checked,f={nama:val("#n"),wa:val("#w"),svc:val("#s"),kg:parseFloat(val("#k"))||0,jemput:j,alamat:j?val("#a"):"",cat:val("#c")};
  if(editId){const x=S.orders.find(y=>y.id===editId);if(x.svc!==f.svc)x.harga=f.svc==="khusus"?S.set.khu:S.set.reg;Object.assign(x,f);if(j&&!x.biayaJemput)x.biayaJemput=S.set.jem;await put(x)}
  else{await api("/api/orders","POST",f).catch(()=>toast("Gagal menyimpan."));await load()}
  editId=null;tab="list";filt="aktif";viewAdmin();toast("Pesanan tersimpan.");
 }
 else if(a==="saves"){S.set=await api("/api/settings","PUT",{reg:+val("#p1")||0,khu:+val("#p2")||0,jem:+val("#p3")||0,bayar:val("#p4")});tab="list";viewAdmin();toast("Pengaturan tersimpan.")}
});


function login(msg){
 document.title="Masuk admin";
 app.innerHTML=`<header class="top"><div class="brand">Laundry <span class="pk">Halal</span></div><p>Admin</p></header><main class="wrap"><div class="panel"><h2>Masuk admin</h2>${msg?`<p class="hint">${msg}</p>`:""}<label class="f">Password<input type="password" id="pw" autocomplete="current-password"></label><button id="go" type="button">Masuk</button></div></main>`;
 const go=async()=>{pw=document.getElementById("pw").value;sessionStorage.setItem("lhpw",pw);await start()};
 document.getElementById("go").onclick=go;
 document.getElementById("pw").onkeydown=e=>{if(e.key==="Enter")go()};
}
async function start(){
 try{await load();viewAdmin()}
 catch(e){if(e.message!=="401")app.innerHTML='<p class="note" style="text-align:center;padding:40px">Gagal memuat data. Periksa koneksi database di Vercel.</p>'}
}
pw?start():login();
