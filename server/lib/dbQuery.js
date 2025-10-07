// server/lib/dbQuery.js
const db = require("../db");

/**
 * dbQuery(sql, params)
 * Always returns rows only (ignores fields).
 */
async function dbQuery(sql, params = []) {
  const [rows] = await db.query(sql, params);
  return rows;
}

module.exports = dbQuery;
