// server/routes/expenses.js
const express = require("express");
const db = require("../lib/db");
const router = express.Router();

// GET all expenses
router.get("/", async (req, res) => {
  try {
    const { from, to, q } = req.query;
    let sql = "SELECT * FROM expenses WHERE 1=1";
    const params = [];
    if (from) { sql += " AND expense_date >= ?"; params.push(from); }
    if (to) { sql += " AND expense_date <= ?"; params.push(to); }
    if (q) { sql += " AND (category LIKE ? OR party_name LIKE ?)"; params.push(`%${q}%`, `%${q}%`); }
    sql += " ORDER BY expense_date DESC, id DESC";
    const rows = await db.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET expense by ID
router.get("/:id", async (req, res) => {
  try {
    const [row] = await db.query("SELECT * FROM expenses WHERE id = ?", [req.params.id]);
    if (!row) return res.status(404).json({ success: false, error: "Not found" });
    res.json({ success: true, data: row });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// CREATE new expense
router.post("/", async (req, res) => {
  try {
    const { expense_no, party_name, expense_date, amount, category, notes } = req.body;
    const result = await db.query(
      "INSERT INTO expenses (expense_no, party_name, expense_date, amount, category, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [expense_no, party_name, expense_date, amount, category, notes]
    );
    const [created] = await db.query("SELECT * FROM expenses WHERE id = ?", [result.insertId]);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// UPDATE expense
router.put("/:id", async (req, res) => {
  try {
    const { expense_no, party_name, expense_date, amount, category, notes } = req.body;
    const id = req.params.id;
    await db.query(
      "UPDATE expenses SET expense_no=?, party_name=?, expense_date=?, amount=?, category=?, notes=? WHERE id=?",
      [expense_no, party_name, expense_date, amount, category, notes, id]
    );
    const [updated] = await db.query("SELECT * FROM expenses WHERE id = ?", [id]);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE expense
router.delete("/:id", async (req, res) => {
  try {
    await db.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
