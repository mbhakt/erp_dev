// server/routes/items.js
const express = require("express");
const router = express.Router();

// dbQuery should be a small helper that returns Promise resolving rows
// (your project already had a lib/dbQuery, so require that)
const dbQuery = require("../lib/dbQuery");

/*
  This router expects to be mounted as:
    app.use('/api/items', require('./routes/items'));
  so that full endpoints are:
    GET    /api/items
    GET    /api/items/:id
    POST   /api/items
    PUT    /api/items/:id
    DELETE /api/items/:id
*/

console.log("[routes/items] loaded");

router.get("/", async (req, res) => {
  try {
    const sql = `SELECT id, sku, name, description, unit, sale_price, purchase_price, qty_in_stock, created_at, updated_at
                 FROM items
                 ORDER BY name ASC`;
    const rows = await dbQuery(sql);
    return res.json(Array.isArray(rows) ? rows : []);
  } catch (err) {
    console.error("[GET /api/items] error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const sql = `SELECT id, sku, name, description, unit, sale_price, purchase_price, qty_in_stock, created_at, updated_at
                 FROM items WHERE id = ? LIMIT 1`;
    const rows = await dbQuery(sql, [id]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({ error: "Item not found" });
    }
    return res.json(rows[0]);
  } catch (err) {
    console.error("[GET /api/items/:id] error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const {
      sku = null,
      name = null,
      description = null,
      unit = null,
      sale_price = 0,
      purchase_price = 0,
      qty_in_stock = 0,
    } = req.body || {};

    const sql = `INSERT INTO items (sku, name, description, unit, sale_price, purchase_price, qty_in_stock)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
    const result = await dbQuery(sql, [sku, name, description, unit, sale_price, purchase_price, qty_in_stock]);

    // Return newly created item summary
    return res.status(201).json({
      id: result.insertId,
      sku,
      name,
      description,
      unit,
      sale_price,
      purchase_price,
      qty_in_stock,
    });
  } catch (err) {
    console.error("[POST /api/items] error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const {
      sku = null,
      name = null,
      description = null,
      unit = null,
      sale_price = 0,
      purchase_price = 0,
      qty_in_stock = 0,
    } = req.body || {};

    const sql = `UPDATE items
                 SET sku=?, name=?, description=?, unit=?, sale_price=?, purchase_price=?, qty_in_stock=?, updated_at = NOW()
                 WHERE id = ?`;
    const result = await dbQuery(sql, [sku, name, description, unit, sale_price, purchase_price, qty_in_stock, id]);

    // optionally check affectedRows (some dbQuery helpers return different shapes)
    return res.json({
      id,
      sku,
      name,
      description,
      unit,
      sale_price,
      purchase_price,
      qty_in_stock,
    });
  } catch (err) {
    console.error("[PUT /api/items/:id] error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    await dbQuery("DELETE FROM items WHERE id = ?", [id]);
    return res.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/items/:id] error:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
