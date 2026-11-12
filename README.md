# Laundry Halal: Web App

Sistem laundry sederhana: halaman pemesanan untuk pelanggan dan dashboard admin.

- `/` : halaman pemesanan (taruh link ini di bio Instagram)
- `/admin` : dashboard admin (pesanan, jemputan, invoice WA, pengaturan)

## Struktur
```
public/   halaman statis (index.html, admin.html, style.css, common.js, order.js, admin.js)
api/      fungsi serverless Vercel (orders.js, settings.js)
lib/      helper Redis dan cek password admin
```

## Deploy ke Vercel
1. Push folder ini ke repo GitHub.
2. Di Vercel: **Add New → Project**, impor repo tersebut. Framework preset: **Other**. Tanpa build command.
3. Buka tab **Storage** pada project, tambahkan **Upstash for Redis** (Marketplace), lalu hubungkan ke project. Variabel `KV_REST_API_URL` dan `KV_REST_API_TOKEN` terisi otomatis. Jika namanya berbeda (misalnya `UPSTASH_REDIS_REST_URL`), `lib/redis.js` sudah menangani keduanya.
4. Di **Settings → Environment Variables**, tambahkan `ADMIN_PASSWORD` dengan password yang kuat.
5. **Redeploy**, lalu buka `/admin` dan masuk dengan password tadi.

## Pengembangan lokal
```
npm i -g vercel
vercel link && vercel env pull .env.local
vercel dev
```

## Yang perlu disesuaikan
- Nomor WhatsApp admin dan alamat kios: konstanta `WA` dan `ADDR` di `public/common.js`.
- Harga, biaya jemput, dan info pembayaran: menu **Pengaturan** di dashboard (harga di halaman pelanggan ikut berubah).

## Catatan
- Tombol WA membuka chat WhatsApp dengan pesan siap kirim; admin menekan kirim sendiri. Pengiriman otomatis butuh WhatsApp Business API.
- Password admin dikirim lewat HTTPS pada setiap permintaan API. Cukup untuk usaha kecil; untuk akses banyak staf, pertimbangkan login per akun.
- Belum ada pembatasan laju (rate limit) pada pemesanan publik. Tambahkan jika mulai ada spam.
