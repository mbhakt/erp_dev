// server/routes/purchases.js
// Purchases routes with real transactions using pool.getConnection()

const express = require("express");
const router = express.Router();
const db = require("../db"); // this should be your mysql2/promise pool

/**
 * GET /api/purchases
 * List purchases with party name
 */
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT p.id, p.date, p.party_id, p.notes, p.sub_total, p.tax_total, p.grand_total, p.created_at,
              pt.name AS party_name
       FROM purchases p
       LEFT JOIN parties pt ON pt.id = p.party_id
       ORDER BY p.created_at DESC`
    );
    res.json(rows || []);
  } catch (err) {
    console.error("GET /api/purchases error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/**
 * POST /api/purchases
 * Create purchase with lines inside a transaction
 */
router.post("/", async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const { party_id, date, notes = "", lines = [] } = req.body || {};

    // --- calculate totals ---
    let sub_total = 0;
    let tax_total = 0;
    for (const l of lines) {
      const qty = Number(l.qty) || 0;
      const rate = Number(l.rate) || 0;
      const lineTotal = qty * rate;
      const tax = (lineTotal * (Number(l.taxPercent) || 0)) / 100;
      sub_total += lineTotal;
      tax_total += tax;
      l._line_total = Number(lineTotal.toFixed(2));
      l._tax = Number(tax.toFixed(2));
    }
    const grand_total = Number((sub_total + tax_total).toFixed(2));
    sub_total = Number(sub_total.toFixed(2));
    tax_total = Number(tax_total.toFixed(2));

    // --- insert purchase header ---
    const [result] = await conn.query(
      `INSERT INTO purchases (party_id, date, notes, sub_total, tax_total, grand_total)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [party_id || null, date || null, notes, sub_total, tax_total, grand_total]
    );

    const purchaseId = result.insertId;

    // --- insert purchase lines ---
    if (Array.isArray(lines) && lines.length) {
      const values = lines.map((l) => [
        purchaseId,
        l.item_id || null,
        Number(l.qty) || 0,
        Number(l.rate) || 0,
        Number(l.taxPercent) || 0,
        Number(l._line_total || 0),
      ]);
      const lineInsertSql =
        "INSERT INTO purchase_lines (purchase_id, item_id, qty, rate, tax_percent, line_total) VALUES ?";
      await conn.query(lineInsertSql, [values]);
    }

    await conn.commit();

    // --- fetch and return created purchase + lines ---
    const [purchaseRow] = await conn.query("SELECT * FROM purchases WHERE id = ?", [purchaseId]);
    const [insertedLines] = await conn.query("SELECT * FROM purchase_lines WHERE purchase_id = ?", [purchaseId]);

    conn.release();
    res.status(201).json({ id: purchaseId, purchase: purchaseRow[0], lines: insertedLines });
  } catch (err) {
    await conn.rollback().catch(() => {});
    conn.release();
    console.error("POST /api/purchases error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
