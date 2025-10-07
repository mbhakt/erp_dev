// server/db.js
// Central MySQL connection pool using mysql2/promise

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "erp_user",
  password: process.env.DB_PASS || "StrongPasswordHere!",
  database: process.env.DB_NAME || "erp_dev",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
