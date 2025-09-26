// server/routes/invoices.js
const express = require("express");
const router = express.Router();

// If your project uses a DB helper like server/db.js, require it. Otherwise, we fallback to db.json in project root.
let db;
try {
  db = require("../db"); // expected to export a pool or helper methods
} catch (e) {
  db = null;
}

const fs = require("fs");
const path = require("path");
const DB_JSON = path.join(__dirname, "..", "..", "db.json");

// helper: read db.json if DB helper not present
function readJsonDb() {
  try {
    const raw = fs.readFileSync(DB_JSON, "utf8");
    const data = JSON.parse(raw);
    return data;
  } catch (err) {
    return {};
  }
}

// GET /api/invoices  -> list
router.get("/", async (req, res) => {
  try {
    if (db && typeof db.query === "function") {
      // If server/db.js exports a mysql pool with query
      const q = "SELECT * FROM invoices ORDER BY id DESC";
      const [rows] = await db.query(q);
      // optionally attach items per invoice (simple separate query)
      // but to keep it simple, return invoices only and let frontend fetch items via /api/invoices/:id
      return res.json(rows);
    } else {
      // fallback: read db.json
      const data = readJsonDb();
      const invoices = data.invoices || [];
      return res.json(invoices);
    }
  } catch (err) {
    console.error("invoices list error:", err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

// GET /api/invoices/:id  -> single invoice + items (so frontend edit form can request full object)
router.get("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (db && typeof db.query === "function") {
      // adapt this SQL to your schema
      const [rows] = await db.query("SELECT * FROM invoices WHERE id = ?", [id]);
      if (!rows || rows.length === 0) return res.status(404).json({ error: "not found" });
      const invoice = rows[0];
      // fetch items for this invoice (if invoice_items table exists)
      try {
        const [items] = await db.query("SELECT * FROM invoice_items WHERE invoice_id = ?", [id]);
        invoice.items = items;
      } catch (e) {
        // ignore if items table not present
      }
      return res.json(invoice);
    } else {
      const data = readJsonDb();
      const inv = (data.invoices || []).find((x) => String(x.id) === String(id) || String(x.invoice_no) === String(id));
      if (!inv) return res.status(404).json({ error: "not found" });
      // if db.json contains invoice_items, attach them
      const invItems = (data.invoice_items || []).filter((it) => String(it.invoice_id) === String(inv.id));
      if (invItems.length) inv.items = invItems;
      return res.json(inv);
    }
  } catch (err) {
    console.error("invoices get error:", err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

// POST /api/invoices  -> create (very simple)
router.post("/", async (req, res) => {
  try {
    const payload = req.body;
    if (db && typeof db.query === "function") {
      // insert into invoices table - adapt fields for your schema
      const [result] = await db.query("INSERT INTO invoices (invoice_no, party_id, invoice_date, total, notes) VALUES (?, ?, ?, ?, ?)",
        [payload.invoice_no, payload.party_id, payload.invoice_date, payload.total, payload.notes]);
      const newId = result.insertId;
      // optionally insert invoice_items if provided
      if (Array.isArray(payload.items) && payload.items.length) {
        for (const it of payload.items) {
          await db.query("INSERT INTO invoice_items (invoice_id, item_id, qty, unit_price, discount, amount) VALUES (?, ?, ?, ?, ?, ?)",
            [newId, it.item_id, it.qty, it.unit_price, it.discount, it.amount]);
        }
      }
      const [rows] = await db.query("SELECT * FROM invoices WHERE id = ?", [newId]);
      return res.json(rows[0]);
    } else {
      // if using db.json fallback: append to file (not ideal for concurrency)
      const data = readJsonDb();
      data.invoices = data.invoices || [];
      const nextId = (data.invoices.reduce((m, x) => Math.max(m, Number(x.id || 0)), 0) || 0) + 1;
      const newInv = { id: nextId, ...payload };
      data.invoices.push(newInv);
      // attach invoice_items in db.json if present
      data.invoice_items = data.invoice_items || [];
      if (Array.isArray(payload.items)) {
        for (const it of payload.items) {
          data.invoice_items.push({ id: (data.invoice_items.length || 0) + 1, invoice_id: nextId, ...it });
        }
      }
      fs.writeFileSync(DB_JSON, JSON.stringify(data, null, 2), "utf8");
      return res.json(newInv);
    }
  } catch (err) {
    console.error("invoice create error:", err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

// PUT /api/invoices/:id -> update (simplified)
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const payload = req.body;
  try {
    if (db && typeof db.query === "function") {
      await db.query("UPDATE invoices SET invoice_no=?, party_id=?, invoice_date=?, total=?, notes=? WHERE id=?",
        [payload.invoice_no, payload.party_id, payload.invoice_date, payload.total, payload.notes, id]);
      // optionally update items - skipping complexity (delete & insert recommended)
      const [rows] = await db.query("SELECT * FROM invoices WHERE id = ?", [id]);
      return res.json(rows[0]);
    } else {
      const data = readJsonDb();
      const idx = (data.invoices || []).findIndex(x => String(x.id) === String(id));
      if (idx === -1) return res.status(404).json({ error: "not found" });
      data.invoices[idx] = { ...data.invoices[idx], ...payload, id: Number(id) };
      fs.writeFileSync(DB_JSON, JSON.stringify(data, null, 2), "utf8");
      return res.json(data.invoices[idx]);
    }
  } catch (err) {
    console.error("invoice update error:", err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

// DELETE /api/invoices/:id
router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  try {
    if (db && typeof db.query === "function") {
      await db.query("DELETE FROM invoices WHERE id = ?", [id]);
      // remove invoice_items optionally
      return res.json({ ok: true });
    } else {
      const data = readJsonDb();
      data.invoices = (data.invoices || []).filter(x => String(x.id) !== String(id));
      data.invoice_items = (data.invoice_items || []).filter(it => String(it.invoice_id) !== String(id));
      fs.writeFileSync(DB_JSON, JSON.stringify(data, null, 2), "utf8");
      return res.json({ ok: true });
    }
  } catch (err) {
    console.error("invoice delete error:", err);
    return res.status(500).json({ error: err.message || "server error" });
  }
});

module.exports = router;
