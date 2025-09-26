// server/index.js
// Express server with invoices + invoice_items CRUD that matches your existing schema.
// Important: This file uses column names: invoice_no, party_id, invoice_date, total, created_at
// Invoice items use: invoice_id, name, qty, price, amount

const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bodyParser = require("body-parser");
const partiesRouter = require('./routes/parties');
const purchasesRouter = require('./routes/purchases');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/parties", partiesRouter);
app.use('/api/purchases', purchasesRouter);

// Create pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASS || "",
  database: process.env.DB_NAME || "erp_dev",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// expose pool on locals (optional)
app.locals.pool = pool;

// --- Utility logger for errors ---
function logSqlError(err) {
  console.error("SQL ERROR:", err && err.message);
  if (err && err.sql) {
    console.error("SQL:", err.sql);
  }
  if (err && err.sqlMessage) {
    console.error("sqlMessage:", err.sqlMessage);
  }
}

// Debug route
app.get("/api/_dbinfo", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT DATABASE() as db, USER() as user;");
    return res.json({ ok: true, dbinfo: rows[0] });
  } catch (err) {
    console.error("dbinfo error", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// in server file, e.g. server/index.js or routes/test.js
app.get('/api/purchases', (req, res) => {
  // Temporary placeholder while backend logic is implemented
  res.json([]);
});

// GET /api/invoices - list invoices (join party name if exists)
app.get("/api/invoices", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT i.*, p.name as party_name
       FROM invoices i
       LEFT JOIN parties p ON i.party_id = p.id
       ORDER BY i.invoice_date DESC, i.id DESC`
    );
    res.json(rows);
  } catch (err) {
    logSqlError(err);
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// GET /api/invoices/:id - single invoice with items
app.get("/api/invoices/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const [[inv]] = await pool.query("SELECT * FROM invoices WHERE id = ?", [id]);
    if (!inv) return res.status(404).json({ error: "Invoice not found" });

    const [items] = await pool.query(
      `SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id ASC`,
      [id]
    );
    inv.items = items;
    res.json(inv);
  } catch (err) {
    logSqlError(err);
    res.status(500).json({ error: "Failed to fetch invoice" });
  }
});

// POST /api/invoices - create invoice + items
app.post("/api/invoices", async (req, res) => {
  // Log request body for debugging
  console.log("POST /api/invoices payload:", JSON.stringify(req.body, null, 2));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { invoice_no, party_id, invoice_date, items = [], notes } = req.body;

    // Compute total from items (amount = qty * price - discount if any; simple here)
    let total = 0;
    const normalizedItems = items.map((it) => {
      // accept either (name, qty, unit_price) or (item_id, unit_price)
      const qty = Number(it.qty || it.quantity || 0);
      const price = Number(it.unit_price ?? it.price ?? it.sale_price ?? 0);
      const discount = Number(it.discount || 0);
      const amount = price * qty - discount;
      total += amount;
      return {
        name: it.name || it.item_name || null,
        qty,
        price,
        amount,
      };
    });

    // Insert invoice (use column names that exist in your DB)
    const [r] = await conn.query(
      `INSERT INTO invoices (invoice_no, party_id, invoice_date, total, created_at)
       VALUES (?,?,?,?,NOW())`,
      [invoice_no, party_id || null, invoice_date || new Date(), total]
    );
    const invoiceId = r.insertId;

    // Insert invoice_items
    for (const it of normalizedItems) {
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, name, qty, price, amount)
         VALUES (?,?,?,?,?)`,
        [invoiceId, it.name, it.qty, it.price, it.amount]
      );
    }

    await conn.commit();

    const [[newInv]] = await pool.query("SELECT * FROM invoices WHERE id = ?", [invoiceId]);
    res.status(201).json(newInv);
  } catch (err) {
    await conn.rollback();
    logSqlError(err);
    // send the raw sqlMessage if available for quicker debugging
    const msg = (err && (err.sqlMessage || err.message)) || "Failed to create invoice";
    res.status(500).json({ error: msg });
  } finally {
    conn.release();
  }
});

// PUT /api/invoices/:id - update invoice + items (replace items)
app.put("/api/invoices/:id", async (req, res) => {
  console.log("PUT /api/invoices/:id payload:", JSON.stringify(req.body, null, 2));
  const invoiceId = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { invoice_no, party_id, invoice_date, items = [], notes } = req.body;

    let total = 0;
    const normalizedItems = items.map((it) => {
      const qty = Number(it.qty || it.quantity || 0);
      const price = Number(it.unit_price ?? it.price ?? 0);
      const discount = Number(it.discount || 0);
      const amount = price * qty - discount;
      total += amount;
      return { name: it.name || it.item_name || null, qty, price, amount };
    });

    await conn.query(
      `UPDATE invoices SET invoice_no=?, party_id=?, invoice_date=?, total=? WHERE id=?`,
      [invoice_no, party_id || null, invoice_date || new Date(), total, invoiceId]
    );

    // Delete old items and insert new ones
    await conn.query(`DELETE FROM invoice_items WHERE invoice_id = ?`, [invoiceId]);
    for (const it of normalizedItems) {
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, name, qty, price, amount) VALUES (?,?,?,?,?)`,
        [invoiceId, it.name, it.qty, it.price, it.amount]
      );
    }

    await conn.commit();
    const [[updated]] = await pool.query("SELECT * FROM invoices WHERE id = ?", [invoiceId]);
    res.json(updated);
  } catch (err) {
    await conn.rollback();
    logSqlError(err);
    res.status(500).json({ error: err.sqlMessage || err.message || "Failed to update invoice" });
  } finally {
    conn.release();
  }
});

// DELETE invoice
app.delete("/api/invoices/:id", async (req, res) => {
  const invoiceId = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    // delete items first
    await conn.query("DELETE FROM invoice_items WHERE invoice_id = ?", [invoiceId]);
    await conn.query("DELETE FROM invoices WHERE id = ?", [invoiceId]);
    await conn.commit();
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    logSqlError(err);
    res.status(500).json({ error: "Failed to delete invoice" });
  } finally {
    conn.release();
  }
});

// Minimal parties/items endpoints used by frontend
app.get("/api/parties", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, name, phone FROM parties ORDER BY name");
    res.json(rows);
  } catch (err) {
    logSqlError(err);
    res.status(500).json({ error: "Failed to fetch parties" });
  }
});

app.get("/api/items", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, sku, name, sale_price FROM items ORDER BY name");
    res.json(rows);
  } catch (err) {
    logSqlError(err);
    res.status(500).json({ error: "Failed to fetch items" });
  }
});

// Create party
app.post('/api/parties', async (req, res) => {
  try {
    const { name, type, phone, email, address, gstin, balance = 0 } = req.body;

    const [result] = await pool.query(
      `INSERT INTO parties (name, type, phone, email, address, gstin, balance)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, type, phone, email, address, gstin, Number(balance || 0)]
    );

    const [rows] = await pool.query('SELECT * FROM parties WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('create party error', err);
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/parties/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { name, type, phone, email, address, gstin, balance = 0 } = req.body;

    await pool.query(
      `UPDATE parties
       SET name = ?, type = ?, phone = ?, email = ?, address = ?, gstin = ?, balance = ?
       WHERE id = ?`,
      [name, type, phone, email, address, gstin, Number(balance || 0), id]
    );

    const [[party]] = await pool.query('SELECT * FROM parties WHERE id = ?', [id]);
    res.json(party);
  } catch (err) {
    console.error('update party error', err);
    res.status(500).json({ error: err.message });
  }
});


app.delete('/api/parties/:id', async (req, res) => {
  const id = req.params.id;
  console.log(`DELETE /api/parties/${id} called`);          // <-- request log
  try {
    // Optional: check if the party exists first
    const [[existing]] = await pool.query('SELECT id FROM parties WHERE id = ?', [id]);
    if (!existing) {
      console.log(`Party ${id} not found`);
      return res.status(404).json({ error: 'Party not found' });
    }

    // Attempt delete
    const [result] = await pool.query('DELETE FROM parties WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      console.log(`Delete affectedRows=0 for party ${id}`);
      return res.status(404).json({ error: 'Party not found' });
    }

    console.log(`Party ${id} deleted`);
    return res.json({ ok: true });
  } catch (err) {
    // Log detailed error for debugging
    console.error('Party delete failed:', {
      id,
      code: err.code,
      errno: err.errno,
      sqlMessage: err.sqlMessage,
      sql: err.sql
    });

    // Common MySQL foreign key error codes:
    // 1451 ER_ROW_IS_REFERENCED_2 (cannot delete or update a parent row: a foreign key constraint fails)
    if (err.errno === 1451 || err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({
        error: 'cannot_delete',
        message: 'Party is referenced by other records (invoices/purchases). Delete dependent records first or remove reference.'
      });
    }

    // For other errors return generic 500 but include message
    return res.status(500).json({ error: 'delete_failed', message: err.sqlMessage || err.message });
  }
});

// root
app.get("/", (req, res) => {
  res.send("ERP Backend running 🚀");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
