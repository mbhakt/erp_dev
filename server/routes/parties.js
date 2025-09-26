// server/routes/parties.js
const express = require('express');
const router = express.Router();

// NOTE: expects app.locals.pool to be set from server/index.js
// e.g. app.locals.pool = mysql.createPool(...)

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    const [rows] = await pool.query('SELECT * FROM parties ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error('GET /api/parties error:', err.code, err.sqlMessage);
    res.status(500).json({ error: 'Failed to fetch parties' });
  }
});

router.post('/', async (req, res) => {
  const pool = req.app.locals.pool;
  console.log('POST /api/parties payload:', req.body);
  try {
    const { name, type = null, phone = null, email = null, address = null, gstin = null } = req.body;
    const [result] = await pool.query(
      `INSERT INTO parties (name, type, phone, email, address, gstin)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, type, phone, email, address, gstin]
    );
    const [rows] = await pool.query('SELECT * FROM parties WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error('POST /api/parties failed:', err.code, err.errno, err.sqlMessage);
    console.error('Full error object:', err);
    res.status(500).json({ error: err.message, code: err.code, sqlMessage: err.sqlMessage });
  }
});

router.put('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const id = req.params.id;
  console.log(`PUT /api/parties/${id} payload:`, req.body);
  try {
    const { name, type = null, phone = null, email = null, address = null, gstin = null } = req.body;
    await pool.query(
      `UPDATE parties SET name = ?, type = ?, phone = ?, email = ?, address = ?, gstin = ? WHERE id = ?`,
      [name, type, phone, email, address, gstin, id]
    );
    const [rows] = await pool.query('SELECT * FROM parties WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return res.status(404).json({ error: 'Party not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(`PUT /api/parties/${id} failed:`, err.code, err.sqlMessage);
    res.status(500).json({ error: err.message, code: err.code, sqlMessage: err.sqlMessage });
  }
});

router.delete('/:id', async (req, res) => {
  const pool = req.app.locals.pool;
  const id = req.params.id;
  console.log(`DELETE /api/parties/${id} requested`);
  try {
    // Check for invoices (or other FK references) that reference this party
    const [[countRow]] = await pool.query('SELECT COUNT(*) as cnt FROM invoices WHERE party_id = ?', [id]);
    const count = countRow ? Number(countRow.cnt || countRow.COUNT || countRow['COUNT(*)']) : 0;
    if (count > 0) {
      // There are invoices referencing this party — refuse delete with 409 (conflict)
      return res.status(409).json({ error: 'Cannot delete party: it has associated invoices' });
    }

    // (Optional) check other tables too if you have purchase_bills etc
    // const [[pCount]] = await pool.query('SELECT COUNT(*) as cnt FROM purchases WHERE party_id = ?', [id]);
    // if (Number(pCount.cnt) > 0) return res.status(409).json({ error: 'Cannot delete party: has purchases' });

    const [result] = await pool.query('DELETE FROM parties WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Party not found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(`DELETE /api/parties/${id} failed:`, err.code, err.sqlMessage);
    console.error('Full error object:', err);
    res.status(500).json({ error: err.message, code: err.code, sqlMessage: err.sqlMessage });
  }
});

module.exports = router;
