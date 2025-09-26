// src/pages/InvoicesPage.jsx
import React, { useEffect, useState } from "react";
import InvoiceForm from "../components/InvoiceForm";
import { fetchInvoices, deleteInvoice } from "../api";

// Format a date to DD-MM-YYYY (Indian format)
function formatIndianDate(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

/**
 * Robust invoice total extraction.
 * - Prefer direct invoice-level totals (strings or numbers).
 * - Try common keys and nested paths.
 * - If not present, try various item lists and compute per-item total.
 */
function computeInvoiceTotal(invoice) {
  if (!invoice) return 0;

  // 1) Try direct invoice-level totals (accept strings and numbers)
  const directKeys = [
    "total", "amount", "grand_total", "total_amount", "invoice_total", "net_total",
    "grandTotal", "totalValue", "value", "amt"
  ];
  for (const k of directKeys) {
    if (invoice[k] !== undefined && invoice[k] !== null) {
      const n = Number(invoice[k]);
      if (!Number.isNaN(n)) return n;
    }
  }

  // 2) Try nested objects/paths that sometimes contain totals
  const nestedPaths = [
    ["totals","grand"], ["summary","total"], ["amounts","total"], ["totals","total"], ["summary","grandTotal"]
  ];
  for (const path of nestedPaths) {
    let obj = invoice;
    for (const p of path) {
      if (!obj) break;
      obj = obj[p];
    }
    if (obj !== undefined && obj !== null && !Number.isNaN(Number(obj))) return Number(obj);
  }

  // 3) Find items array under common keys
  const possibleItemsKeys = [
    "items","invoice_items","invoiceItems","rows","lines","line_items","lineItems",
    "details","items_list","data","itemsData"
  ];
  let items = null;
  for (const k of possibleItemsKeys) {
    if (Array.isArray(invoice[k])) {
      items = invoice[k];
      break;
    }
    // wrapper case: items: { data: [...] }
    if (invoice[k] && Array.isArray(invoice[k].data)) {
      items = invoice[k].data;
      break;
    }
  }

  // 4) Fallback wrappers
  if (!items) {
    if (invoice.data && Array.isArray(invoice.data.invoices)) items = invoice.data.invoices;
    else if (invoice.data && Array.isArray(invoice.data)) items = invoice.data;
  }

  // 5) Compute sum from items if available
  if (Array.isArray(items) && items.length > 0) {
    const sum = items.reduce((acc, it) => {
      if (!it) return acc;
      // item-level amount fields (strings allowed)
      const itemAmountKeys = ["amount","line_amount","line_total","total","value","amt"];
      for (const k of itemAmountKeys) {
        if (it[k] !== undefined && it[k] !== null) {
          const num = Number(it[k]);
          if (!Number.isNaN(num)) return acc + num;
        }
      }
      const qty = Number(it.qty ?? it.quantity ?? it.q ?? 0);
      const rate = Number(it.unit_price ?? it.price ?? it.rate ?? it.sale_price ?? 0);
      const disc = Number(it.discount ?? it.disc ?? 0);
      const candidate = (qty * rate) - disc;
      return acc + (Number.isNaN(candidate) ? 0 : candidate);
    }, 0);

    if (sum > 0) return sum;
  }

  // 6) Try scanning top-level arrays as a last attempt
  for (const k of Object.keys(invoice)) {
    const maybe = invoice[k];
    if (maybe && Array.isArray(maybe)) {
      const s = maybe.reduce((acc, it) => {
        const n = Number(it.amount ?? it.total ?? (it.qty * it.price) ?? 0);
        return acc + (Number.isNaN(n) ? 0 : n);
      }, 0);
      if (s > 0) return s;
    }
  }

  // 7) Debug: print a trimmed sample to console so we can adapt if still zero
  // eslint-disable-next-line no-console
  console.debug("computeInvoiceTotal: could not determine total for invoice sample:", {
    id: invoice.id ?? invoice._id ?? invoice.invoice_no,
    keys: Object.keys(invoice).slice(0,50),
  });

  return 0;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await fetchInvoices();
      // debug raw response (could be array or wrapped object)
      // eslint-disable-next-line no-console
      console.debug("DEBUG /api/invoices response:", res);

      let list = [];
      if (!res) list = [];
      else if (Array.isArray(res)) list = res;
      else if (Array.isArray(res.data)) list = res.data;
      else if (Array.isArray(res.invoices)) list = res.invoices;
      else if (Array.isArray(res.items)) list = res.items;
      else if (res.data && Array.isArray(res.data.invoices)) list = res.data.invoices;
      else list = [];

      setInvoices(list);
    } catch (err) {
      console.error("Failed to load invoices", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalSales = invoices.reduce((s, inv) => {
    const amt = computeInvoiceTotal(inv);
    return s + (Number.isNaN(amt) ? 0 : amt);
  }, 0);

  async function handleDelete(id) {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      await load();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed. See console logs.");
    }
  }

  function openNew() {
    setEditingId(null);
    setShowForm(true);
  }

  function openEdit(id) {
    setEditingId(id);
    setShowForm(true);
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Sale Invoices</h2>
        <div>
          <button className="px-3 py-2 bg-pink-500 text-white rounded" onClick={openNew}>
            + Add Sale
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4 mb-4">
        <div className="mb-4">
          <div className="text-sm text-gray-600">Total Sales Amount</div>
          <div className="text-2xl font-bold">₹ {Number(totalSales || 0).toFixed(2)}</div>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left">
                <th className="p-2">Date</th>
                <th className="p-2">Invoice No</th>
                <th className="p-2">Party</th>
                <th className="p-2">Amount</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-4 text-center text-gray-500">
                    No invoices found.
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => {
                  const id = inv.id ?? inv._id ?? inv.invoice_id ?? inv.invoiceNo ?? inv.invoice_no;
                  const amt = computeInvoiceTotal(inv);
                  return (
                    <tr key={id} className="border-t">
                      <td className="p-2">{formatIndianDate(inv.invoice_date ?? inv.created_at ?? inv.date)}</td>
                      <td className="p-2">{inv.invoice_no ?? inv.invoiceNo}</td>
                      <td className="p-2">{inv.party_name ?? inv.partyName ?? (inv.party && inv.party.name) ?? inv.customer_name ?? ""}</td>
                      <td className="p-2">₹ {Number(amt || 0).toFixed(2)}</td>
                      <td className="p-2">
                        <button className="px-2 py-1 border rounded mr-2" onClick={() => openEdit(id)}>
                          Edit
                        </button>
                        <button className="px-2 py-1 border rounded" onClick={() => handleDelete(id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded shadow p-4">
          <InvoiceForm
            invoiceId={editingId}
            onSaved={() => {
              setShowForm(false);
              setEditingId(null);
              load();
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingId(null);
            }}
          />
        </div>
      )}
    </div>
  );
}
