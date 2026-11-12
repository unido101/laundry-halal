const { cmd, admin, settings } = require("../lib/redis");

module.exports = async (req, res) => {
  try {
    const isAdmin = admin(req);
    if (req.method === "PUT") {
      if (!isAdmin) return res.status(401).json({ error: "unauthorized" });
      const b = req.body || {};
      const s = { reg: +b.reg || 0, khu: +b.khu || 0, jem: +b.jem || 0, bayar: String(b.bayar || "").slice(0, 500) };
      await cmd("SET", "lh:settings", JSON.stringify(s));
      return res.json(s);
    }
    const s = await settings();
    res.setHeader("Cache-Control", "no-store");
    // Info pembayaran hanya untuk admin; harga boleh dilihat publik.
    return res.json(isAdmin ? s : { reg: s.reg, khu: s.khu, jem: s.jem });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server error" });
  }
};
