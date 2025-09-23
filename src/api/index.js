// src/api/index.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

/* ------------------ Invoices ------------------ */
export const fetchInvoices = () =>
  api.get("/invoices").then((r) => r.data);

export const fetchInvoice = (id) =>
  api.get(`/invoices/${id}`).then((r) => r.data);

export const createInvoice = (payload) =>
  api.post("/invoices", payload).then((r) => r.data);

export const updateInvoice = (id, payload) =>
  api.put(`/invoices/${id}`, payload).then((r) => r.data);

export const deleteInvoice = (id) =>
  api.delete(`/invoices/${id}`).then((r) => r.data);

/* ------------------ Parties ------------------ */
export const fetchParties = () =>
  api.get("/parties").then((r) => r.data);

export const createParty = (payload) =>
  api.post("/parties", payload).then((r) => r.data);

export const updateParty = (id, payload) =>
  api.put(`/parties/${id}`, payload).then((r) => r.data);

export const deleteParty = (id) =>
  api.delete(`/parties/${id}`).then((r) => r.data);

/* ------------------ Items ------------------ */
export const fetchItems = () =>
  api.get("/items").then((r) => r.data);

export const createItem = (payload) =>
  api.post("/items", payload).then((r) => r.data);

export const updateItem = (id, payload) =>
  api.put(`/items/${id}`, payload).then((r) => r.data);

export const deleteItem = (id) =>
  api.delete(`/items/${id}`).then((r) => r.data);

/* ------------------ Purchases ------------------ */
export const fetchPurchases = () =>
  api.get("/purchases").then((r) => r.data);

export const fetchPurchase = (id) =>
  api.get(`/purchases/${id}`).then((r) => r.data);

export const createPurchase = (payload) =>
  api.post("/purchases", payload).then((r) => r.data);

export const updatePurchase = (id, payload) =>
  api.put(`/purchases/${id}`, payload).then((r) => r.data);

export const deletePurchase = (id) =>
  api.delete(`/purchases/${id}`).then((r) => r.data);

export default api;
