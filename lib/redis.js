const crypto = require("crypto");
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const DEF = { reg: 6000, khu: 8000, jem: 0, bayar: "Pembayaran tunai di kios, atau transfer (isi rekening di Pengaturan)." };

async function cmd(...args) {
  const r = await fetch(URL_, { method: "POST", headers: { Authorization: "Bearer " + TOKEN }, body: JSON.stringify(args) });
  const j = await r.json();
  if (j.error) throw new Error(j.error);
  return j.result;
}

function admin(req) {
  const pw = process.env.ADMIN_PASSWORD || "";
  const a = Buffer.from((req.headers.authorization || "").replace(/^Bearer /, ""));
  const b = Buffer.from(pw);
  return pw.length > 0 && a.length === b.length && crypto.timingSafeEqual(a, b);
}

async function settings() {
  const s = await cmd("GET", "lh:settings");
  return { ...DEF, ...(s ? JSON.parse(s) : {}) };
}

module.exports = { cmd, admin, settings };
