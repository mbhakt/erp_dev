// src/api/invoices.js
const base = "/api/invoices";

async function handleResponse(res) {
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const err = new Error(data?.message || `Request failed: ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function fetchInvoices(query = "") {
  const url = query ? `${base}?${query}` : base;
  const res = await fetch(url, { credentials: "include" });
  return handleResponse(res);
}

export async function fetchInvoice(id) {
  const res = await fetch(`${base}/${encodeURIComponent(id)}`, { credentials: "include" });
  return handleResponse(res);
}

export async function createInvoice(payload) {
  const res = await fetch(base, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function updateInvoice(id, payload) {
  const res = await fetch(`${base}/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return handleResponse(res);
}

export async function deleteInvoice(id) {
  const res = await fetch(`${base}/${encodeURIComponent(id)}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handleResponse(res);
}

export default {
  fetchInvoices,
  fetchInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
