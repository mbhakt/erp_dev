const express = require("express");
const router = express.Router();
const { ensurePool } = require("../db"); // adjust path if your helper differs

/**
 * Routes for parties
 *
 * - GET /api/parties        -> list (brief)
 * - GET /api/parties/:id    -> single (detail)
 * - POST /api/parties       -> create
 * - PUT /api/parties/:id    -> update (optional)
 */

router.get("/", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  try {
    const [rows] = await pool.query(
      `SELECT id, name, phone, email, created_at
       FROM parties
       ORDER BY id DESC
       LIMIT 500`
    );

    const out = (rows || []).map(r => ({
      id: r.id,
      // frontend may expect either "name" or "party_name" — provide both
      name: r.name || "",
      party_name: r.name || "",
      phone: r.phone || "",
      email: r.email || "",
      // If you have a balance column, replace 0 with the column name (r.balance)
      balance: r.balance || 0,
      created_at: r.created_at ? String(r.created_at).slice(0, 19) : null
    }));

    console.log("GET /api/parties ->", out.length, "rows");
    res.json(out);
  } catch (err) {
    console.error("GET /api/parties error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  try {
    const [[row]] = await pool.query("SELECT * FROM parties WHERE id = ?", [id]);
    if (!row) return res.status(404).json({ error: "Party not found" });
    res.json(row);
  } catch (err) {
    console.error("GET /api/parties/:id error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------------------------
   CREATE party
   --------------------------- */
router.post("/", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  // Accept payload: { name, phone, email, billing_address }
  const { name = "", phone = null, email = null, billing_address = null } = req.body || {};

  // quick validation
  if (!name || String(name).trim() === "") {
    return res.status(400).json({ error: "Party name is required." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    console.log("POST /api/parties payload:", { name, phone, email, billing_address });

    const [r] = await conn.query(
      `INSERT INTO parties
         (name, phone, email, billing_address, created_at, updated_at)
       VALUES (?, ?, ?, ?, NOW(), NOW())`,
      [String(name).trim(), phone, email, billing_address]
    );

    const insertId = r.insertId;

    // fetch created row to return
    const [[createdRow]] = await pool.query("SELECT * FROM parties WHERE id = ?", [insertId]);

    await conn.commit();
    res.status(201).json(createdRow || { id: insertId });
  } catch (err) {
    await conn.rollback();
    console.error("POST /api/parties error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

/* ---------------------------
   UPDATE party (optional)
   --------------------------- */
router.put("/:id", async (req, res) => {
  const pool = ensurePool(req, res);
  if (!pool) return;

  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ error: "Invalid id" });

  const { name = "", phone = null, email = null, billing_address = null } = req.body || {};
  if (!name || String(name).trim() === "") {
    return res.status(400).json({ error: "Party name is required." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    await conn.query(
      `UPDATE parties
       SET name=?, phone=?, email=?, billing_address=?, updated_at=NOW()
       WHERE id=?`,
      [String(name).trim(), phone, email, billing_address, id]
    );

    const [[updatedRow]] = await pool.query("SELECT * FROM parties WHERE id = ?", [id]);

    await conn.commit();
    res.json(updatedRow || {});
  } catch (err) {
    await conn.rollback();
    console.error("PUT /api/parties/:id error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
