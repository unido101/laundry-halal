const { cmd, admin, settings } = require("../lib/redis");
const t = (s, n) => String(s == null ? "" : s).replace(/\s+/g, " ").trim().slice(0, n);

module.exports = async (req, res) => {
  try {
    const isAdmin = admin(req);

    // Publik: pelanggan membuat pesanan. Admin juga memakai ini untuk pesanan manual.
    if (req.method === "POST") {
      const b = req.body || {};
      const nama = t(b.nama, 80), wa = t(b.wa, 20), alamat = t(b.alamat, 300), jemput = b.jemput === true;
      if (!nama || wa.replace(/\D/g, "").length < 10 || (jemput && !alamat)) return res.status(400).json({ error: "data tidak lengkap" });
      const s = await settings();
      const svc = b.svc === "khusus" ? "khusus" : "reguler";
      const kg = Math.max(0, Math.min(500, parseFloat(b.kg) || 0));
      const id = "LH-" + String(await cmd("INCR", "lh:seq")).padStart(4, "0");
      const o = { id, ts: Date.now(), status: "Baru", lunas: false, nama, wa, svc, harga: svc === "khusus" ? s.khu : s.reg, jemput, alamat: jemput ? alamat : "", biayaJemput: jemput ? s.jem : 0, cat: t(b.cat, 300) };
      if (isAdmin) o.kg = kg; else o.est = kg; // pelanggan hanya memberi estimasi
      await cmd("HSET", "lh:orders", id, JSON.stringify(o));
      return res.status(201).json({ id });
    }

    if (!isAdmin) return res.status(401).json({ error: "unauthorized" });

    if (req.method === "GET") {
      const r = (await cmd("HGETALL", "lh:orders")) || [];
      const orders = [];
      for (let i = 1; i < r.length; i += 2) orders.push(JSON.parse(r[i]));
      res.setHeader("Cache-Control", "no-store");
      return res.json({ orders });
    }
    if (req.method === "PUT") {
      const o = req.body;
      if (!o || !/^LH-\d{4,}$/.test(o.id)) return res.status(400).json({ error: "id tidak valid" });
      await cmd("HSET", "lh:orders", o.id, JSON.stringify(o));
      return res.json({ ok: true });
    }
    if (req.method === "DELETE") {
      await cmd("HDEL", "lh:orders", String(req.query.id || ""));
      return res.json({ ok: true });
    }
    res.status(405).end();
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
};
