// server/routes/purchases.js
const express = require("express");
const router = express.Router();

/**
 * Purchases API routes.
 *
 * Expects server/index.js to set:
 *   app.locals.pool = mysql.createPool({...})
 *
 * Routes:
 * GET    /api/purchases         -> list purchases (most recent first)
 * GET    /api/purchases/:id     -> get single purchase with its items
 * POST   /api/purchases         -> create purchase + items (transactional)
 * PUT    /api/purchases/:id     -> update purchase + items (transactional)
 *
 * Request body for POST/PUT:
 * {
 *   vendor_id: <int|null>,
 *   vendor_name: <string>,
 *   bill_no: <string>,
 *   bill_date: <YYYY-MM-DD> (optional),
 *   notes: <string>,
 *   items: [ { item_id: <int|null>, description, qty, rate, tax_percent } ]
 * }
 */

function ensurePool(req, res) {
  const pool = req.app.locals.pool;
  if (!pool) {
    res.status(500).json({ error: "DB pool not available (app.locals.pool)" });
    return null;
  }
  return pool;
}

/* ---------------------------
   LIST purchases
   --------------------------- */
router.get("/", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  try {
    const [rows] = await pool.query(
      `SELECT pb.id, pb.bill_no, pb.vendor_name, pb.bill_date, pb.total
       FROM purchase_bills pb
       ORDER BY pb.bill_date DESC, pb.id DESC
       LIMIT 200`
    );
    // Normalize bill_date to date-only "YYYY-MM-DD" so frontend never sees a timezone timestamp.
    const normalized = (rows || []).map(r => {
      let bill_date = null;
      if (r && r.bill_date) {
        try {
          // r.bill_date might be a Date object (from mysql driver) or a string.
          if (r.bill_date instanceof Date) {
            bill_date = r.bill_date.toISOString().slice(0, 10);
          } else {
            // string like "YYYY-MM-DD ..." or ISO -> take first 10 chars
            bill_date = String(r.bill_date).trim().slice(0, 10);
          }
        } catch (e) {
          bill_date = null;
        }
      }
      return { ...r, bill_date };
    });

    res.json(normalized);
  } catch (err) {
    console.error("GET /api/purchases error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------
   GET single purchase + items
   --------------------------- */
router.get("/:id", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [[bill]] = await pool.query("SELECT * FROM purchase_bills WHERE id = ?", [id]);
    if (!bill) return res.status(404).json({ error: "Purchase not found" });

    // Normalize bill_date to "YYYY-MM-DD"
    let bill_date = null;
    if (bill.bill_date) {
      try {
        if (bill.bill_date instanceof Date) {
          bill_date = bill.bill_date.toISOString().slice(0, 10);
        } else {
          bill_date = String(bill.bill_date).trim().slice(0, 10);
        }
      } catch (e) {
        bill_date = null;
      }
    }
    bill.bill_date = bill_date;


    const [items] = await pool.query(
      `SELECT pi.*, it.name AS item_name, it.sku
       FROM purchase_items pi
       LEFT JOIN items it ON pi.item_id = it.id
       WHERE pi.purchase_id = ?
       ORDER BY pi.id ASC`,
      [id]
    );

    bill.items = items;
    res.json(bill);
  } catch (err) {
    console.error("GET /api/purchases/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------
   CREATE purchase + items
   --------------------------- */
router.post("/", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      vendor_id = null,
      vendor_name = "",
      bill_no = "",
      bill_date = null,
      notes = "",
      items = []
    } = req.body || {};

    // compute totals
    let subtotal = 0;
    let tax_total = 0;
    let total = 0;

    for (const it of items) {
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const taxPercent = Number(it.tax_percent || 0);

      const line = qty * rate;
      const tax = (line * taxPercent) / 100;
      const line_total = line + tax;

      subtotal += line;
      tax_total += tax;
      total += line_total;
    }

    // Insert purchase bill
    const [r] = await conn.query(
      `INSERT INTO purchase_bills
        (vendor_id, vendor_name, bill_no, bill_date, subtotal, tax_total, total, notes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [vendor_id, vendor_name, bill_no, bill_date, subtotal, tax_total, total, notes]
    );

    const purchaseId = r.insertId;

    // Insert line items
    for (const it of items) {
      const item_id = it.item_id || null;
      const description = it.description || "";
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const tax_percent = Number(it.tax_percent || 0);

      const line = qty * rate;
      const tax = (line * tax_percent) / 100;
      const line_total = line + tax;

      await conn.query(
        `INSERT INTO purchase_items
         (purchase_id, item_id, description, qty, rate, tax_percent, tax_amount, line_total, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [purchaseId, item_id, description, qty, rate, tax_percent, tax, line_total]
      );
    }

    await conn.commit();

    // Return the created purchase with items
    const [[newBill]] = await pool.query("SELECT * FROM purchase_bills WHERE id = ?", [purchaseId]);
    const [billItems] = await pool.query(
      `SELECT pi.*, it.name AS item_name, it.sku
       FROM purchase_items pi
       LEFT JOIN items it ON pi.item_id = it.id
       WHERE pi.purchase_id = ? ORDER BY pi.id ASC`,
      [purchaseId]
    );
    newBill.items = billItems;

    res.status(201).json(newBill);
  } catch (err) {
    await conn.rollback();
    console.error("POST /api/purchases error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/* ---------------------------
   CREATE purchase + items
   --------------------------- */
router.post("/", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      vendor_id = null,
      vendor_name = "",
      bill_no = "",
      bill_date = null,
      notes = "",
      items = []
    } = req.body || {};

    // Normalize incoming bill_date to "yyyy-mm-dd" (take first 10 chars)
    const bill_date_norm = bill_date ? String(bill_date).trim().slice(0, 10) : null;
    console.log("POST /api/purchases incoming bill_date:", bill_date, "normalized:", bill_date_norm);

    // compute totals
    let subtotal = 0;
    let tax_total = 0;
    let total = 0;

    for (const it of items) {
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const taxPercent = Number(it.tax_percent || 0);

      const line = qty * rate;
      const tax = (line * taxPercent) / 100;
      const line_total = line + tax;

      subtotal += line;
      tax_total += tax;
      total += line_total;
    }

    // Insert purchase bill (use DATE(?) to ensure only date portion is stored)
    const [r] = await conn.query(
      `INSERT INTO purchase_bills
        (vendor_id, vendor_name, bill_no, bill_date, subtotal, tax_total, total, notes, created_at, updated_at)
       VALUES (?, ?, ?, DATE(?), ?, ?, ?, ?, NOW(), NOW())`,
      [vendor_id, vendor_name, bill_no, bill_date_norm, subtotal, tax_total, total, notes]
    );

    const purchaseId = r.insertId;

    // Insert line items
    for (const it of items) {
      const item_id = it.item_id || null;
      const description = it.description || "";
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const tax_percent = Number(it.tax_percent || 0);

      const line = qty * rate;
      const tax = (line * tax_percent) / 100;
      const line_total = line + tax;

      await conn.query(
        `INSERT INTO purchase_items
         (purchase_id, item_id, description, qty, rate, tax_percent, tax_amount, line_total, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [purchaseId, item_id, description, qty, rate, tax_percent, tax, line_total]
      );
    }

    await conn.commit();

    // Return the created purchase with items
    const [[newBill]] = await pool.query("SELECT * FROM purchase_bills WHERE id = ?", [purchaseId]);
    const [billItems] = await pool.query(
      `SELECT pi.*, it.name AS item_name, it.sku
       FROM purchase_items pi
       LEFT JOIN items it ON pi.item_id = it.id
       WHERE pi.purchase_id = ? ORDER BY pi.id ASC`,
      [purchaseId]
    );

    // Normalize outgoing bill_date to YYYY-MM-DD so frontend never receives timestamp
    newBill.bill_date = newBill.bill_date ? String(newBill.bill_date).slice(0, 10) : null;
    newBill.items = billItems;

    res.status(201).json(newBill);
  } catch (err) {
    await conn.rollback();
    console.error("POST /api/purchases error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/* ---------------------------
   UPDATE purchase + items
   --------------------------- */
router.put("/:id", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  const purchaseId = Number(req.params.id);
  if (!purchaseId) return res.status(400).json({ error: "Invalid id" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const {
      vendor_id = null,
      vendor_name = "",
      bill_no = "",
      bill_date = null,
      notes = "",
      items = []
    } = req.body || {};

    // Normalize incoming bill_date
    const bill_date_norm = bill_date ? String(bill_date).trim().slice(0, 10) : null;
    console.log("PUT /api/purchases/:id incoming bill_date:", bill_date, "normalized:", bill_date_norm);

    // compute totals
    let subtotal = 0;
    let tax_total = 0;
    let total = 0;

    for (const it of items) {
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const taxPercent = Number(it.tax_percent || 0);

      const line = qty * rate;
      const tax = (line * taxPercent) / 100;
      subtotal += line;
      tax_total += tax;
      total += line + tax;
    }

    // Update purchase bill (use DATE(?) to ensure only date portion is stored)
    await conn.query(
      `UPDATE purchase_bills
       SET vendor_id=?, vendor_name=?, bill_no=?, bill_date=DATE(?),
           subtotal=?, tax_total=?, total=?, notes=?, updated_at=NOW()
       WHERE id=?`,
      [vendor_id, vendor_name, bill_no, bill_date_norm, subtotal, tax_total, total, notes, purchaseId]
    );

    // Remove old items
    await conn.query("DELETE FROM purchase_items WHERE purchase_id=?", [purchaseId]);

    // Insert updated line items
    for (const it of items) {
      const qty = Number(it.qty || 0);
      const rate = Number(it.rate || 0);
      const taxPercent = Number(it.tax_percent || 0);

      const line = qty * rate;
      const tax = (line * taxPercent) / 100;

      await conn.query(
        `INSERT INTO purchase_items
         (purchase_id, item_id, description, qty, rate, tax_percent, tax_amount, line_total, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [
          purchaseId,
          it.item_id || null,
          it.description || "",
          qty,
          rate,
          taxPercent,
          tax,
          line + tax,
        ]
      );
    }

    await conn.commit();

    // Return updated purchase (normalize bill_date for frontend)
    const [[updatedBill]] = await pool.query("SELECT * FROM purchase_bills WHERE id=?", [purchaseId]);
    const [billItems] = await pool.query(
      `SELECT pi.*, it.name AS item_name, it.sku
       FROM purchase_items pi
       LEFT JOIN items it ON pi.item_id = it.id
       WHERE pi.purchase_id=? ORDER BY pi.id ASC`,
      [purchaseId]
    );
    updatedBill.bill_date = updatedBill.bill_date ? String(updatedBill.bill_date).slice(0, 10) : null;
    updatedBill.items = billItems;

    res.json(updatedBill);
  } catch (err) {
    await conn.rollback();
    console.error("PUT /api/purchases/:id error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
