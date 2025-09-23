// server/index.js
// Replace your existing server/index.js with this file (adjust env as needed)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

// Create pool using env or defaults
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'erp_dev',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});
app.locals.pool = pool;

/* ------------------ Debug / health ------------------ */
app.get('/api/_dbinfo', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() as db, USER() as user;');
    return res.json({ ok: true, dbinfo: rows[0] });
  } catch (err) {
    console.error('dbinfo error', err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/* ------------------ Parties ------------------ */
app.get('/api/parties', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM parties ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/parties failed:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ Items ------------------ */
app.get('/api/items', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM items ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/items failed:', err);
    res.status(500).json({ error: err.message });
  }
});

/* ------------------ Invoices ------------------ */

/**
 * GET /api/invoices
 * Return list of invoices. Include party name if exists.
 */
app.get('/api/invoices', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT i.*, p.name AS party_name
      FROM invoices i
      LEFT JOIN parties p ON i.party_id = p.id
      ORDER BY i.invoice_date DESC, i.id DESC
    `);
    res.json(rows);
  } catch (err) {
    console.error('GET /api/invoices failed:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/invoices/:id
 * Return invoice and its items
 */
app.get('/api/invoices/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const [[invoice]] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!invoice) return res.status(404).json({ error: 'Invoice not found' });

    const [items] = await pool.query(`
      SELECT ii.*, it.name as item_name, it.sku
      FROM invoice_items ii
      LEFT JOIN items it ON ii.item_id = it.id
      WHERE ii.invoice_id = ?
      ORDER BY ii.id
    `, [id]);

    invoice.items = items;
    res.json(invoice);
  } catch (err) {
    console.error(`GET /api/invoices/${id} failed:`, err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/invoices
 * Create invoice + invoice_items in a transaction
 *
 * Expected req.body:
 * {
 *   invoice_no: 'INV-123',
 *   party_id: 3,                  // optional (nullable)
 *   invoice_date: '2025-09-22',
 *   items: [{ item_id, qty, unit_price, discount }] // or { name, qty, price } depending on UI
 *   notes: 'optional'             // optional: if DB doesn't have notes, it will be ignored
 * }
 *
 * NOTE: This code maps fields to the DB you showed:
 * invoices columns: invoice_no, customer_name (party name), invoice_date, total, received, party_id, created_at
 * invoice_items columns: invoice_id, name, qty, price, amount, created_at
 */
app.post('/api/invoices', async (req, res) => {
  console.log('POST /api/invoices - req.body:', JSON.stringify(req.body, null, 2));

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { invoice_no, party_id, invoice_date, items = [], notes } = req.body;

    // Look up party name (customer_name) if party_id present
    let customer_name = null;
    if (party_id) {
      try {
        const [[partyRow]] = await conn.query('SELECT name FROM parties WHERE id = ?', [party_id]);
        if (partyRow) customer_name = partyRow.name;
      } catch (err) {
        // don't fail whole request for lookup error; log and continue
        console.error('Party lookup failed:', err);
      }
    }

    // Compute total from items; fallback to 0 if no items
    let total = 0;
    for (const it of items) {
      // UI might provide unit_price or price; handle both
      const price = Number(it.unit_price ?? it.price ?? 0);
      const qty = Number(it.qty ?? 0);
      const discount = Number(it.discount ?? 0);
      // assume discount is absolute on the line, not percent
      const line = price * qty - discount;
      total += line;
    }

    // Insert invoice - match your DB columns
    const [r] = await conn.query(
      `INSERT INTO invoices (invoice_no, customer_name, invoice_date, total, received, party_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        invoice_no || null,
        customer_name,
        invoice_date || null,
        total,
        0, // received default 0
        party_id || null,
      ]
    );

    const invoiceId = r.insertId;

    // Insert invoice_items rows
    for (const it of items) {
      // for invoice_items table we observed columns: invoice_id, name, qty, price, amount
      const name = it.name || it.item_name || ''; // fallback to provided name
      const qty = Number(it.qty ?? 0);
      const price = Number(it.unit_price ?? it.price ?? 0);
      const amount = price * qty - Number(it.discount ?? 0);
      await conn.query(
        `INSERT INTO invoice_items (invoice_id, name, qty, price, amount)
         VALUES (?, ?, ?, ?, ?)`,
        [invoiceId, name, qty, price, amount]
      );
    }

    await conn.commit();

    // Fetch inserted invoice back (basic)
    const [[newInv]] = await pool.query('SELECT * FROM invoices WHERE id = ?', [invoiceId]);
    // attach items
    const [newItems] = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
    newInv.items = newItems;

    res.status(201).json(newInv);
  } catch (err) {
    await conn.rollback();

    // Helpful logging for debugging - prints mysql error message and the failing SQL when available
    console.error('Invoice insert failed:', err && err.message, 'sqlMessage:', err && err.sqlMessage, 'sql:', err && err.sql);
    // Return a helpful message to client (do not leak sensitive internals in production)
    res.status(500).json({
      error: 'Invoice insert failed',
      message: err && (err.sqlMessage || err.message),
    });
  } finally {
    conn.release();
  }
});

/**
 * DELETE /api/invoices/:id
 * Remove invoice and its invoice_items (transaction)
 */
app.delete('/api/invoices/:id', async (req, res) => {
  const id = req.params.id;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    const [result] = await conn.query('DELETE FROM invoices WHERE id = ?', [id]);
    await conn.commit();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Invoice not found' });
    res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    console.error(`DELETE /api/invoices/${id} failed:`, err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/**
 * PUT /api/invoices/:id
 * Basic invoice update (not updating items here).
 * If you want to update items, implement full replace logic similarly to POST with a transaction.
 */
app.put('/api/invoices/:id', async (req, res) => {
  const id = req.params.id;
  const { invoice_no, invoice_date, party_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE invoices SET invoice_no = ?, invoice_date = ?, party_id = ? WHERE id = ?',
      [invoice_no || null, invoice_date || null, party_id || null, id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Invoice not found' });
    const [[inv]] = await pool.query('SELECT * FROM invoices WHERE id = ?', [id]);
    res.json(inv);
  } catch (err) {
    console.error(`PUT /api/invoices/${id} failed:`, err);
    res.status(500).json({ error: err.message });
  }
});

/* Root test route */
app.get('/', (req, res) => {
  res.send('ERP Backend running 🚀');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`API running on port ${PORT}`));
