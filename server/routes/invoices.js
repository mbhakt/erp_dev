// server/routes/invoices.js
// Express router for invoices with joined items so frontend can directly display product names.

const express = require("express");
const router = express.Router();
const dbQuery = require("../lib/dbQuery");

/**
 * Helper to normalize invoice row results into consistent shape
 */
function normalizeInvoiceRow(row) {
  return {
    row_id: row.row_id ?? row.id ?? null,
    item_id: row.item_id != null ? String(row.item_id) : null,
    item_name: row.item_name ?? row.name ?? row.description ?? null,
    qty: Number(row.qty ?? row.quantity ?? 1),
    unit_price: Number(row.unit_price ?? row.price ?? row.rate ?? row.sale_price ?? 0),
    discount: Number(row.discount ?? 0),
    amount: Number(row.amount ?? row.line_total ?? ((row.qty ?? 0) * (row.unit_price ?? 0))) || 0,
  };
}

/**
 * GET /api/invoices
 * List invoices (header only)
 */
router.get("/invoices", async (req, res) => {
  try {
    const sql = `SELECT i.*, p.name AS party_name
                 FROM invoices i
                 LEFT JOIN parties p ON p.id = i.party_id
                 ORDER BY i.id DESC`;
    const rows = await dbQuery(sql);
    return res.json(rows);
  } catch (err) {
    console.error("Error fetching invoices:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * GET /api/invoices/:id
 * Return invoice header + items joined to items table (fallback to purchase_items)
 */
router.get("/invoices/:id", async (req, res) => {
  const invoiceId = req.params.id;
  try {
    // Invoice header
    const invSql = `SELECT i.*, p.name AS party_name
                    FROM invoices i
                    LEFT JOIN parties p ON p.id = i.party_id
                    WHERE i.id = ? LIMIT 1`;
    const invRows = await dbQuery(invSql, [invoiceId]);
    if (!invRows || invRows.length === 0) {
      return res.status(404).json({ error: "Invoice not found" });
    }
    const invoice = invRows[0];

    // Try invoice_items join
    const itemsSql = `
      SELECT
        ii.id AS row_id,
        COALESCE(ii.item_id, ii.product_id) AS item_id,
        ii.qty,
        ii.unit_price,
        ii.price,
        ii.discount,
        ii.line_total AS amount,
        COALESCE(ii.description, '') AS description,
        it.id AS item_id_fk,
        it.name AS item_name,
        it.sku AS item_sku,
        it.sale_price AS item_sale_price,
        it.code AS item_code
      FROM invoice_items ii
      LEFT JOIN items it
        ON it.id = ii.item_id OR it.id = ii.product_id
      WHERE ii.invoice_id = ?
      ORDER BY ii.id ASC
    `;
    let rows = await dbQuery(itemsSql, [invoiceId]);

    // Fallback: purchase_items (if schema uses purchase_items)
    if (!rows || rows.length === 0) {
      const altSql = `
        SELECT
          pi.id AS row_id,
          COALESCE(pi.item_id, pi.product_id) AS item_id,
          pi.qty,
          pi.rate AS unit_price,
          pi.price,
          pi.discount,
          pi.line_total AS amount,
          COALESCE(pi.description, '') AS description,
          it.id AS item_id_fk,
          it.name AS item_name,
          it.sku AS item_sku,
          it.sale_price AS item_sale_price,
          it.code AS item_code
        FROM purchase_items pi
        LEFT JOIN items it
          ON it.id = pi.item_id OR it.id = pi.product_id
        WHERE pi.purchase_id = ?
        ORDER BY pi.id ASC
      `;
      try {
        rows = await dbQuery(altSql, [invoiceId]);
      } catch (err) {
        console.warn("purchase_items fallback failed:", err);
        rows = [];
      }
    }

    // Normalize rows
    const normalizedRows = (rows || []).map((r) => {
      const itemId = r.item_id ?? r.item_id_fk ?? null;
      const itemName = r.item_name ?? r.description ?? null;
      const qty = Number(r.qty ?? 1) || 1;
      const unitPrice = Number(r.unit_price ?? r.price ?? r.item_sale_price ?? 0) || 0;
      const discount = Number(r.discount ?? 0) || 0;
      const amount = Number(r.amount ?? qty * unitPrice - discount) || 0;

      return {
        id: r.row_id,
        item_id: itemId ? String(itemId) : null,
        name: itemName,
        qty,
        unit_price: unitPrice,
        discount,
        amount,
      };
    });

    const out = {
      ...invoice,
      items: normalizedRows,
    };

    return res.json(out);
  } catch (err) {
    console.error("Error fetching invoice:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * POST /api/invoices
 */
router.post("/invoices", async (req, res) => {
  try {
    const data = req.body;
    const { invoice_no, party_id, invoice_date, total } = data;

    const sql = `INSERT INTO invoices (invoice_no, party_id, invoice_date, total)
                 VALUES (?, ?, ?, ?)`;
    const result = await dbQuery(sql, [invoice_no, party_id, invoice_date, total]);

    return res.json({ id: result.insertId, ...data });
  } catch (err) {
    console.error("Error creating invoice:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * PUT /api/invoices/:id
 */
router.put("/invoices/:id", async (req, res) => {
  const invoiceId = req.params.id;
  try {
    const data = req.body;
    const { invoice_no, party_id, invoice_date, total } = data;

    const sql = `UPDATE invoices SET invoice_no=?, party_id=?, invoice_date=?, total=? WHERE id=?`;
    await dbQuery(sql, [invoice_no, party_id, invoice_date, total, invoiceId]);

    return res.json({ id: invoiceId, ...data });
  } catch (err) {
    console.error("Error updating invoice:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

/**
 * DELETE /api/invoices/:id
 */
router.delete("/invoices/:id", async (req, res) => {
  const invoiceId = req.params.id;
  try {
    await dbQuery("DELETE FROM invoices WHERE id=?", [invoiceId]);
    return res.json({ success: true });
  } catch (err) {
    console.error("Error deleting invoice:", err);
    return res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
