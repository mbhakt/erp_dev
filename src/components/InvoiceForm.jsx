// src/components/InvoiceForm.jsx
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  fetchParties,
  fetchItems,
  createInvoice,
  updateInvoice,
  fetchInvoice,
  fetchInvoices,
} from "../api";

/* Helpers */
function formatIndianDate(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
function fmtDateForInput(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function parseInvoiceNoNumber(invNo) {
  if (!invNo) return NaN;
  const m = String(invNo).match(/(\d+)\s*$/);
  return m ? Number(m[1]) : NaN;
}
function computeRowAmount(row) {
  const qty = Number(row.qty || 0);
  const rate = Number(row.unit_price || row.price || 0);
  const disc = Number(row.discount || 0);
  const amt = (qty * rate) - disc;
  return Number.isNaN(amt) ? 0 : amt;
}

/* Component */
export default function InvoiceForm({ invoiceId = null, onSaved = null, onCancel = null }) {
  const [parties, setParties] = useState([]);
  const [itemsMaster, setItemsMaster] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const initialForm = {
    invoice_no: "",
    party_id: "",
    invoice_date: fmtDateForInput(new Date()),
    notes: "",
  };
  const [form, setForm] = useState(initialForm);
  const [rows, setRows] = useState([{ item_id: "", qty: 1, unit_price: 0, discount: 0 }]);
  const [lastInvoiceNumeric, setLastInvoiceNumeric] = useState(null);

  const mountedRef = useRef(false);

  useEffect(() => {
    fetchParties().then((r) => setParties(Array.isArray(r) ? r : (r.data || []))).catch(() => setParties([]));
    fetchItems().then((r) => setItemsMaster(Array.isArray(r) ? r : (r.data || []))).catch(() => setItemsMaster([]));
  }, []);

  // propose next invoice no only if form.invoice_no is empty (prevents overriding when editing)
  useEffect(() => {
    async function loadLast() {
      try {
        const res = await fetchInvoices({ limit: 1, sort: "-invoice_no" }).catch(() => null);
        let arr = [];
        if (res) {
          if (Array.isArray(res)) arr = res;
          else if (Array.isArray(res.data)) arr = res.data;
          else if (Array.isArray(res.invoices)) arr = res.invoices;
        }
        if (arr.length > 0) {
          const first = arr[0];
          const invNo = first.invoice_no ?? first.invoiceNo ?? "";
          const n = parseInvoiceNoNumber(invNo);
          if (!Number.isNaN(n)) {
            setLastInvoiceNumeric(n);
            // propose only if not editing and invoice_no empty
            if (!invoiceId && !form.invoice_no) {
              const m = String(invNo).match(/^(.*?)(\d+)\s*$/);
              if (m) {
                const prefix = m[1] || "INV-";
                const nextNum = String(n + 1).padStart(String(n).length, "0");
                setForm((f) => ({ ...f, invoice_no: `${prefix}${nextNum}` }));
              } else {
                setForm((f) => ({ ...f, invoice_no: `INV-${String(n + 1)}` }));
              }
            }
          }
        } else {
          if (!invoiceId && !form.invoice_no) setForm((f) => ({ ...f, invoice_no: `INV-1` }));
        }
      } catch (err) {}
    }
    loadLast();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoiceId]);

  // load invoice details when editing
  useEffect(() => {
    if (!invoiceId) return;
    setLoading(true);
    (async () => {
      try {
        const payload = await fetchInvoice(invoiceId);
        const invoice = payload && payload.invoice ? payload.invoice : (payload.data ? payload.data : payload);
        if (!invoice) throw new Error("No invoice returned");
        setForm({
          invoice_no: invoice.invoice_no ?? invoice.invoiceNo ?? "",
          party_id: String(invoice.party_id ?? invoice.partyId ?? invoice.party_id ?? ""),
          invoice_date: fmtDateForInput(invoice.invoice_date ?? invoice.invoiceDate ?? invoice.created_at ?? new Date()),
          notes: invoice.notes ?? "",
        });
        const itemsList = invoice.items ?? invoice.invoice_items ?? invoice.rows ?? invoice.items_list ?? [];
        if (Array.isArray(itemsList) && itemsList.length > 0) {
          const normalized = itemsList.map((it) => ({
            item_id: String(it.item_id ?? it.itemId ?? it.id ?? it.product_id ?? ""),
            qty: Number(it.qty ?? it.quantity ?? 1),
            unit_price: Number(it.unit_price ?? it.price ?? it.rate ?? 0),
            discount: Number(it.discount ?? 0),
          }));
          setRows(normalized);
        } else {
          setRows([{ item_id: "", qty: 1, unit_price: 0, discount: 0 }]);
        }
      } catch (err) {
        console.error("Failed to load invoice", err);
      } finally {
        setLoading(false);
      }
    })();
  }, [invoiceId]);

  // fill unit price from master
  useEffect(() => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.item_id && (!r.unit_price || Number(r.unit_price) === 0)) {
          const it = itemsMaster.find((x) => String(x.id) === String(r.item_id) || String(x.item_id) === String(r.item_id));
          return { ...r, unit_price: Number(it?.sale_price ?? it?.price ?? it?.rate ?? 0) || r.unit_price };
        }
        return r;
      })
    );
  }, [itemsMaster]);

  const total = useMemo(() => rows.reduce((acc, r) => acc + computeRowAmount(r), 0), [rows]);

  function updateRow(idx, changes) {
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)));
  }
  function addRow() {
    setRows((r) => [...r, { item_id: "", qty: 1, unit_price: 0, discount: 0 }]);
  }
  function removeRow(idx) {
    setRows((r) => r.filter((_, i) => i !== idx));
  }

  async function handleSave() {
    // prevent double submit
    if (saving) return;
    setSaving(true);

    // validations
    if (!form.party_id) {
      setSaving(false);
      return alert("Please select a party.");
    }
    if (!form.invoice_no) {
      setSaving(false);
      return alert("Invoice number required.");
    }
    if (!rows.length) {
      setSaving(false);
      return alert("Add at least one item.");
    }

    // invoice number validation on create only
    if (!invoiceId && lastInvoiceNumeric !== null) {
      const numeric = parseInvoiceNoNumber(form.invoice_no);
      if (Number.isNaN(numeric)) {
        setSaving(false);
        return alert("Invoice number must contain a numeric suffix (e.g. INV-101).");
      }
      if (numeric !== lastInvoiceNumeric + 1) {
        setSaving(false);
        return alert(`Invoice numeric suffix must be previous invoice number +1. Previous: ${lastInvoiceNumeric}. Your invoice numeric part should be ${lastInvoiceNumeric + 1}.`);
      }
    }

    const payload = {
      invoice_no: form.invoice_no,
      party_id: form.party_id,
      invoice_date: form.invoice_date,
      notes: form.notes,
      total: Number(total || 0),
      items: rows.map((r) => ({
        item_id: r.item_id,
        qty: Number(r.qty || 0),
        unit_price: Number(r.unit_price || 0),
        discount: Number(r.discount || 0),
        amount: computeRowAmount(r),
      })),
    };

    try {
      let res;
      if (invoiceId) {
        res = await updateInvoice(invoiceId, payload);
      } else {
        res = await createInvoice(payload);
      }

      alert("Saved successfully.");

      // If parent provided onSaved callback, call it. Otherwise dispatch an event and reload as fallback.
      if (typeof onSaved === "function") {
        try { onSaved(res); } catch (e) {}
      } else {
        try { window.dispatchEvent(new CustomEvent("invoice:saved", { detail: res })); } catch (e) {}
        try { window.location.reload(); } catch (e) {}
      }
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed. See console/network/server logs.");
    } finally {
      setSaving(false);
    }
  }

  // fallback cancel behavior
  function handleCancel() {
    if (typeof onCancel === "function") {
      try { onCancel(); } catch (e) {}
    } else {
      try { window.dispatchEvent(new CustomEvent("invoice:cancel")); } catch (e) {}
      try { window.location.reload(); } catch (e) {}
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3">{invoiceId ? "Edit Invoice" : "New Invoice"}</h3>

      {loading ? <div>Loading invoice...</div> : null}

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-sm font-medium mb-1">Invoice No</label>
          <input
            className="w-full border p-2 rounded"
            value={form.invoice_no}
            onChange={(e) => setForm({ ...form, invoice_no: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Invoice Date</label>
          <input
            type="date"
            className="w-full border p-2 rounded"
            value={form.invoice_date}
            onChange={(e) => setForm({ ...form, invoice_date: e.target.value })}
          />
          <div className="text-xs text-gray-600 mt-1">Display: {formatIndianDate(form.invoice_date)}</div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Party</label>
          <select
            className="w-full border p-2 rounded"
            value={form.party_id}
            onChange={(e) => setForm({ ...form, party_id: e.target.value })}
          >
            <option value="">-- Select Party --</option>
            {parties.map((p) => (
              <option key={p.id ?? p._id} value={String(p.id ?? p._id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <input
            className="w-full border p-2 rounded"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>
      </div>

      <div className="mb-3">
        <table className="min-w-full table-auto">
          <thead>
            <tr className="text-left">
              <th className="p-2">Item</th>
              <th className="p-2">Qty</th>
              <th className="p-2">Rate</th>
              <th className="p-2">Discount</th>
              <th className="p-2">Amount</th>
              <th className="p-2"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const amt = computeRowAmount(r);
              return (
                <tr key={idx} className="border-t">
                  <td className="p-2">
                    <select
                      className="border p-1 rounded w-full"
                      value={r.item_id}
                      onChange={(e) => {
                        const id = e.target.value;
                        const it = itemsMaster.find((x) => String(x.id) === String(id) || String(x.item_id) === String(id));
                        const price = Number(it?.sale_price ?? it?.price ?? it?.rate ?? 0) || r.unit_price;
                        updateRow(idx, { item_id: id, unit_price: price || r.unit_price });
                      }}
                    >
                      <option value="">-- Select Item --</option>
                      {itemsMaster.map((it) => (
                        <option key={it.id ?? it._id} value={String(it.id ?? it._id)}>
                          {it.name} {it.sale_price ? `- ₹${it.sale_price}` : ""}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border p-1 w-20 rounded"
                      value={r.qty}
                      onChange={(e) => updateRow(idx, { qty: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border p-1 w-28 rounded"
                      value={r.unit_price}
                      onChange={(e) => updateRow(idx, { unit_price: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      className="border p-1 w-28 rounded"
                      value={r.discount}
                      onChange={(e) => updateRow(idx, { discount: Number(e.target.value) })}
                    />
                  </td>
                  <td className="p-2">₹ {Number(amt || 0).toFixed(2)}</td>
                  <td className="p-2">
                    <button className="px-2 py-1 border rounded" onClick={() => removeRow(idx)}>
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-2">
          <button className="px-3 py-1 border rounded mr-2" onClick={addRow}>
            + Add line
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded mr-2" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
          <button className="px-4 py-2 border rounded" onClick={handleCancel}>
            Cancel
          </button>
        </div>

        <div className="font-semibold">Total: ₹ {Number(total || 0).toFixed(2)}</div>
      </div>
    </div>
  );
}
