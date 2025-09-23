// server/db.js
const mysql = require("mysql2/promise");
const dotenv = require("dotenv");
dotenv.config();

let pool;

function createPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || "127.0.0.1",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "",
      database: process.env.DB_NAME || "erp_dev",
      port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}

function ensurePool(req, res) {
  try {
    return createPool();
  } catch (err) {
    console.error("DB pool create error:", err);
    if (res && res.status) {
      res.status(500).json({ error: "DB connection error" });
    }
    return null;
  }
}

module.exports = { createPool, ensurePool };
