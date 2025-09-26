// src/api/index.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

async function unwrap(promise) {
  const res = await promise;
  // many servers return { data: ... } or res.data directly
  if (res && res.data !== undefined) return res.data;
  return res;
}

/* ---------- Invoices ---------- */
/**
 * fetchInvoices(params) where params is optional object used as query params
 * e.g. fetchInvoices({ limit: 1, sort: "-invoice_no" })
 */
export const fetchInvoices = (params = {}) => unwrap(api.get("/invoices", { params }));

export const fetchInvoice = (id) => unwrap(api.get(`/invoices/${encodeURIComponent(id)}`));

export const createInvoice = (payload) => unwrap(api.post("/invoices", payload));

export const updateInvoice = (id, payload) => unwrap(api.put(`/invoices/${encodeURIComponent(id)}`, payload));

export const deleteInvoice = (id) => unwrap(api.delete(`/invoices/${encodeURIComponent(id)}`));

/* ---------- Parties ---------- */
export const fetchParties = (params = {}) => unwrap(api.get("/parties", { params }));
export const fetchParty = (id) => unwrap(api.get(`/parties/${encodeURIComponent(id)}`));
export const createParty = (payload) => unwrap(api.post("/parties", payload));
export const updateParty = (id, payload) => unwrap(api.put(`/parties/${encodeURIComponent(id)}`, payload));
export const deleteParty = (id) => unwrap(api.delete(`/parties/${encodeURIComponent(id)}`));

/* ---------- Items ---------- */
export const fetchItems = (params = {}) => unwrap(api.get("/items", { params }));
export const fetchItem = (id) => unwrap(api.get(`/items/${encodeURIComponent(id)}`));
export const createItem = (payload) => unwrap(api.post("/items", payload));
export const updateItem = (id, payload) => unwrap(api.put(`/items/${encodeURIComponent(id)}`, payload));
export const deleteItem = (id) => unwrap(api.delete(`/items/${encodeURIComponent(id)}`));

/* ---------- Purchases (optional) ---------- */
export const fetchPurchases = (params = {}) => unwrap(api.get("/purchases", { params }));
export const fetchPurchase = (id) => unwrap(api.get(`/purchases/${encodeURIComponent(id)}`));
export const createPurchase = (payload) => unwrap(api.post("/purchases", payload));
export const updatePurchase = (id, payload) => unwrap(api.put(`/purchases/${encodeURIComponent(id)}`, payload));
export const deletePurchase = (id) => unwrap(api.delete(`/purchases/${encodeURIComponent(id)}`));

export default api;
