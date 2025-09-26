// server/routes/items.js
const express = require("express");
const router = express.Router();
const { ensurePool } = require("../db");

// helper
function toNumOrNull(v) {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/* GET /api/items */
router.get("/", async (req, res) => {
  try {
    const pool = ensurePool(req, res);
    const [rows] = await pool.query("SELECT * FROM items ORDER BY id DESC");
    res.json(rows);
  } catch (err) {
    console.error("GET /api/items error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* GET /api/items/:id */
router.get("/:id", async (req, res) => {
  try {
    const pool = ensurePool(req, res);
    const [rows] = await pool.query("SELECT * FROM items WHERE id = ?", [req.params.id]);
    res.json(rows[0] || {});
  } catch (err) {
    console.error("GET /api/items/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* POST /api/items */
router.post("/", async (req, res) => {
  try {
    const pool = ensurePool(req, res);
    const {
      name,
      sale_price,
      purchase_price,
      unit,
      sku,
      description,    // frontend may send description OR notes
      notes,          // accept notes if frontend still sends it
      qty_in_stock,
    } = req.body || {};

    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "Item name is required" });
    }

    // choose description field: prefer 'description' if provided; else use 'notes'
    const desc = description ?? notes ?? null;

    const sp = toNumOrNull(sale_price) ?? 0;
    const pp = toNumOrNull(purchase_price) ?? 0;
    const qty = toNumOrNull(qty_in_stock) ?? 0;

    const [result] = await pool.query(
      `INSERT INTO items (name, sale_price, purchase_price, unit, sku, description, qty_in_stock, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [String(name).trim(), sp, pp, unit || null, sku || null, desc, qty]
    );

    const [rows] = await pool.query("SELECT * FROM items WHERE id = ?", [result.insertId]);
    res.json(rows[0] || {});
  } catch (err) {
    console.error("POST /api/items error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* PUT /api/items/:id */
router.put("/:id", async (req, res) => {
  try {
    const pool = ensurePool(req, res);
    const {
      name,
      sale_price,
      purchase_price,
      unit,
      sku,
      description,
      notes,
      qty_in_stock,
    } = req.body || {};

    if (!name || String(name).trim() === "") {
      return res.status(400).json({ error: "Item name is required" });
    }

    const desc = description ?? notes ?? null;

    const sp = toNumOrNull(sale_price) ?? 0;
    const pp = toNumOrNull(purchase_price) ?? 0;
    const qty = toNumOrNull(qty_in_stock) ?? 0;

    await pool.query(
      `UPDATE items
       SET name = ?, sale_price = ?, purchase_price = ?, unit = ?, sku = ?, description = ?, qty_in_stock = ?, updated_at = NOW()
       WHERE id = ?`,
      [String(name).trim(), sp, pp, unit || null, sku || null, desc, qty, req.params.id]
    );

    const [rows] = await pool.query("SELECT * FROM items WHERE id = ?", [req.params.id]);
    res.json(rows[0] || {});
  } catch (err) {
    console.error("PUT /api/items/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

/* DELETE /api/items/:id */
router.delete("/:id", async (req, res) => {
  try {
    const pool = ensurePool(req, res);
    await pool.query("DELETE FROM items WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/items/:id error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
