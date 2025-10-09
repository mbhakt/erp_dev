// src/api/index.js
// Central API aggregator — explicit, non-ambiguous exports

// Re-export the main server-backed wrappers
export * from "./expenses";
export * from "./purchases";
export * from "./items";
export * from "./parties";
export * from "./invoices";

/*
  The mockApi module contains a few helper endpoints used for demo/dashboard data.
  Only export the names from mockApi that do NOT clash with the server wrappers.
  Do NOT re-export functions that are already exported above (e.g. fetchInvoices)
  to avoid ambiguous star exports.
*/
export { fetchBanks, fetchDashboard, fetchReports, fetchPartyTransactions } from "./mockApi";
