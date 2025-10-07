// src/api/index.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

async function unwrap(promise) {
  const res = await promise;
  if (res && res.data !== undefined) return res.data;
  return res;
}

/* ---------- Items normalization ---------- */
function normalizeItem(obj) {
  if (!obj || typeof obj !== "object") return null;
  return {
    id: String(obj.id ?? obj.item_id ?? obj._id ?? obj.product_id ?? ""),
    name: obj.name ?? obj.description ?? obj.title ?? "",
    sku: obj.sku ?? obj.code ?? obj.item_code ?? "",
    sale_price: Number(obj.sale_price ?? obj.price ?? obj.rate ?? obj.unit_price ?? 0) || 0,
    raw: obj,
  };
}

/* ---------- Invoices normalization ---------- */
function normalizeInvoiceObject(obj) {
  if (!obj || typeof obj !== "object") return null;
  const invoice = { ...obj };
  invoice.invoice_no =
    invoice.invoice_no ??
    invoice.invoiceNo ??
    invoice.number ??
    invoice.id ??
    "";
  invoice.invoice_date =
    invoice.invoice_date ??
    invoice.invoiceDate ??
    invoice.created_at ??
    invoice.createdAt ??
    invoice.date ??
    "";

  const itemsList =
    invoice.items ??
    invoice.invoice_items ??
    invoice.rows ??
    invoice.items_list ??
    invoice.lines ??
    [];

  if (Array.isArray(itemsList)) {
    invoice.items = itemsList.map((it) => {
      // ✅ FIX: fall back to `id` when `item_id` is null
      const itemId = String(
        it.item_id ??
          it.product_id ??
          it.itemId ??
          it.productId ??
          it.id ??
          ""
      );
      return {
        item_id: itemId,
        qty: Number(it.qty ?? it.quantity ?? 1),
        unit_price: Number(
          it.unit_price ?? it.price ?? it.rate ?? it.sale_price ?? 0
        ),
        discount: Number(it.discount ?? 0),
        amount: Number(
          it.amount ??
            it.line_total ??
            (Number(it.qty ?? it.quantity ?? 0) *
              Number(it.unit_price ?? it.price ?? it.rate ?? 0))
        ),
      };
    });
  } else {
    invoice.items = [];
  }
  return invoice;
}

function normalizeInvoicesArray(payload) {
  if (!payload) return [];
  if (Array.isArray(payload))
    return payload.map(normalizeInvoiceObject).filter(Boolean);
  if (Array.isArray(payload.data))
    return payload.data.map(normalizeInvoiceObject).filter(Boolean);
  if (Array.isArray(payload.invoices))
    return payload.invoices.map(normalizeInvoiceObject).filter(Boolean);
  if (payload.invoice && typeof payload.invoice === "object")
    return [normalizeInvoiceObject(payload.invoice)].filter(Boolean);
  return [normalizeInvoiceObject(payload)].filter(Boolean);
}

/* ---------- API functions ---------- */
export const fetchInvoices = async (params = {}) => {
  const res = await unwrap(api.get("/invoices", { params }));
  return normalizeInvoicesArray(res);
};

export const fetchInvoice = async (id) => {
  const res = await unwrap(api.get(`/invoices/${encodeURIComponent(id)}`));
  const arr = normalizeInvoicesArray(res);
  return arr[0] ?? null;
};

export const createInvoice = (payload) =>
  unwrap(api.post("/invoices", payload));
export const updateInvoice = (id, payload) =>
  unwrap(api.put(`/invoices/${encodeURIComponent(id)}`, payload));
export const deleteInvoice = (id) =>
  unwrap(api.delete(`/invoices/${encodeURIComponent(id)}`));

/* ------------------ Parties ------------------ */
export const fetchParties = (params = {}) =>
  unwrap(api.get("/parties", { params }));
export const fetchPartyBasic = (id) =>
  unwrap(api.get(`/parties/${encodeURIComponent(id)}`));
export const createParty = (payload) => unwrap(api.post("/parties", payload));
export const updateParty = (id, payload) =>
  unwrap(api.put(`/parties/${encodeURIComponent(id)}`, payload));
export const deleteParty = (id) =>
  unwrap(api.delete(`/parties/${encodeURIComponent(id)}`));

/* ------------------ Items ------------------ */
export const fetchItems = async (params = {}) => {
  const res = await unwrap(api.get("/items", { params }));
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  return Array.isArray(arr) ? arr.map(normalizeItem).filter(Boolean) : [];
};

export const fetchItem = async (id) => {
  const res = await unwrap(api.get(`/items/${encodeURIComponent(id)}`));
  const obj = res?.data ?? res?.item ?? res;
  return normalizeItem(obj);
};

export const createItem = (payload) => unwrap(api.post("/items", payload));
export const updateItem = (id, payload) =>
  unwrap(api.put(`/items/${encodeURIComponent(id)}`, payload));
export const deleteItem = (id) =>
  unwrap(api.delete(`/items/${encodeURIComponent(id)}`));

// Add this near the Items / Purchases exports
export const fetchPurchaseItem = async (id) => {
  try {
    const res = await unwrap(api.get(`/purchase_items/${encodeURIComponent(id)}`));
    // unwrap shape: res or res.data
    return res;
  } catch (err) {
    console.warn("fetchPurchaseItem failed for", id, err);
    return null;
  }
};

export const fetchExpenses = (params = {}) => unwrap(api.get("/expenses", { params }));
export const fetchExpense  = (id) => unwrap(api.get(`/expenses/${encodeURIComponent(id)}`));
export const createExpense = (payload) => unwrap(api.post("/expenses", payload));
export const updateExpense = (id, payload) => unwrap(api.put(`/expenses/${encodeURIComponent(id)}`, payload));
export const deleteExpense = (id) => unwrap(api.delete(`/expenses/${encodeURIComponent(id)}`));


/* ------------------ Purchases ------------------ */

/* ------------------ Purchases (normalize + enrich) ------------------ */

function normalizePurchase(obj) {
  if (!obj || typeof obj !== "object") return null;
  const totalNum = Number(
    obj.grand_total ?? obj.total_amount ?? obj.total ?? obj.amount ?? obj.purchase_total ?? 0
  ) || 0;
  const partyId = obj.party_id ?? obj.partyId ?? obj.party ?? null;

  return {
    id: String(obj.id ?? obj._id ?? obj.purchase_id ?? ""),
    billNo: obj.bill_no ?? obj.billNo ?? obj.invoice_no ?? obj.invoiceNo ?? obj.no ?? (obj.id ? String(obj.id) : ""),
    vendorName: obj.party_name ?? obj.vendor_name ?? obj.vendorName ?? null, // may be filled later
    party_id: partyId,
    billDate: obj.bill_date ?? obj.billDate ?? obj.date ?? obj.created_at ?? null,
    total: totalNum,
    createdAt: obj.created_at ?? obj.createdAt ?? null,
    updatedAt: obj.updated_at ?? obj.updatedAt ?? null,
    raw: obj,
    // compatibility
    bill_no: obj.bill_no ?? undefined,
    vendor_name: obj.vendor_name ?? undefined,
    bill_date: obj.bill_date ?? undefined,
    grand_total: obj.grand_total ?? undefined,
    total_amount: obj.total_amount ?? undefined,
  };
}

// helper: fetch party by id (returns null for falsy/0 ids)
export const fetchParty = async (id) => {
  if (id === null || id === undefined || id === 0 || String(id) === "0") return null;
  const res = await unwrap(api.get(`/parties/${encodeURIComponent(id)}`));
  return res?.data ?? res;
};

// fetch list of purchases, normalize, then try to enrich vendorName for purchases that have party_id but no vendorName
export const fetchPurchases = async (params = {}) => {
  const res = await unwrap(api.get("/purchases", { params }));
  const arr = Array.isArray(res) ? res : res?.data ?? [];
  const normalized = Array.isArray(arr) ? arr.map(normalizePurchase).filter(Boolean) : [];

  // collect non-zero missing party ids where vendorName is empty
  const missingIds = Array.from(new Set(
    normalized
      .filter(p => p.party_id !== null && p.party_id !== undefined && !p.vendorName && String(p.party_id) !== "0")
      .map(p => String(p.party_id))
  ));

  if (missingIds.length > 0) {
    // fetch party records in parallel; ignore errors/404s silently
    await Promise.all(missingIds.map(async (idStr) => {
      try {
        const partyRes = await api.get(`/parties/${encodeURIComponent(idStr)}`);
        const partyObj = partyRes?.data ?? partyRes;
        const name = partyObj?.name ?? partyObj?.party_name ?? "";
        if (name) {
          normalized.forEach(p => {
            if (String(p.party_id) === String(idStr) && !p.vendorName) p.vendorName = name;
          });
        }
      } catch (err) {
        // ignore (404 etc.)
      }
    }));
  }

  return normalized;
};

export const fetchPurchase = async (id) => {
  const res = await unwrap(api.get(`/purchases/${encodeURIComponent(id)}`));
  const obj = res?.data ?? res;
  const norm = normalizePurchase(obj);
  if (norm && !norm.vendorName && norm.party_id && String(norm.party_id) !== "0") {
    try {
      const partyRes = await api.get(`/parties/${encodeURIComponent(norm.party_id)}`);
      const partyObj = partyRes?.data ?? partyRes;
      norm.vendorName = partyObj?.name ?? partyObj?.party_name ?? norm.vendorName;
    } catch (err) {
      // ignore
    }
  }
  return norm;
};

export const createPurchase = (payload) => unwrap(api.post("/purchases", payload));
export const updatePurchase = (id, payload) => unwrap(api.put(`/purchases/${encodeURIComponent(id)}`, payload));
export const deletePurchase = (id) => unwrap(api.delete(`/purchases/${encodeURIComponent(id)}`));

export default api;
