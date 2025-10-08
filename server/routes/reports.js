// server/routes/reports.js
const express = require("express");
const db = require("../lib/db");
const router = express.Router();

router.get("/transactions", async (req, res) => {
  try {
    const { from, to, type } = req.query;
    let sqls = [];
    if (!type || type === "Purchase" || type === "all") {
      sqls.push(db.query("SELECT id, 'Purchase' AS type, bill_no AS ref, vendor_name AS party, bill_date AS date, total AS amount FROM purchases"));
    }
    if (!type || type === "Expense" || type === "all") {
      sqls.push(db.query("SELECT id, 'Expense' AS type, expense_no AS ref, party_name AS party, expense_date AS date, amount FROM expenses"));
    }
    if (!type || type === "Sale" || type === "all") {
      sqls.push(db.query("SELECT id, 'Sale' AS type, invoice_no AS ref, party_name AS party, invoice_date AS date, total AS amount FROM invoices"));
    }
    const results = await Promise.all(sqls);
    const all = results.flat().filter(Boolean);
    all.sort((a, b) => new Date(b.date) - new Date(a.date));
    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
