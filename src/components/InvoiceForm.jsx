// src/components/InvoiceForm.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  fetchParties,
  fetchItems,
  createInvoice,
  updateInvoice,
  fetchInvoice,
  fetchInvoices,
} from "../api";

/* ---------- Small helpers ---------- */
function fmtDateForInput(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}
function formatIndianDate(isoOrDate) {
  if (!isoOrDate) return "";
  const d = new Date(isoOrDate);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
function computeRowAmount(row) {
  const qty = Number(row.qty || 0);
  const rate = Number(row.unit_price || row.price || 0);
  const disc = Number(row.discount || 0);
  const amt = qty * rate - disc;
  return Number.isNaN(amt) ? 0 : amt;
}
function parseInvoiceNoNumber(invNo) {
  if (!invNo) return NaN;
  const m = String(invNo).match(/(\d+)\s*$/);
  return m ? Number(m[1]) : NaN;
}
function unwrap(res) {
  if (!res) return res;
  if (Array.isArray(res)) return res;
  if (res.data) return res.data;
  if (res.invoices) return res.invoices;
  return res;
}

/* ---------- Component ---------- */
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

  /* Load parties and items master once */
  useEffect(() => {
    fetchParties()
      .then((r) => setParties(unwrap(r) || []))
      .catch(() => setParties([]));
    fetchItems()
      .then((r) => setItemsMaster(unwrap(r) || []))
      .catch(() => setItemsMaster([]));
  }, []);

  /* Suggest next invoice no (only for new) */
  useEffect(() => {
    if (invoiceId) return;
    (async () => {
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
            setForm((f) => {
              if (f.invoice_no) return f;
              const m = String(invNo).match(/^(.*?)(\d+)\s*$/);
              const digits = m ? m[2].length : Math.max(String(n + 1).length, 3);
              const nextNum = String(n + 1).padStart(Math.max(digits, 3), "0");
              const prefix = m ? (m[1] || "") : "";
              return { ...f, invoice_no: `${prefix}${nextNum}` };
            });
          }
        } else {
          setForm((f) => (f.invoice_no ? f : { ...f, invoice_no: `001` }));
          setLastInvoiceNumeric(0);
        }
      } catch (e) {
        console.warn("Failed to propose invoice no:", e);
      }
    })();
  }, [invoiceId]);

  /* Load invoice details when editing and enrich rows using itemsMaster */
  useEffect(() => {
    if (!invoiceId) return;
    let cancelled = false;
    setLoading(true);

    (async () => {
      try {
        const payload = await fetchInvoice(invoiceId);
        const invoice = unwrap(payload);
        if (!invoice) throw new Error("No invoice returned");

        setForm({
          invoice_no: invoice.invoice_no ?? invoice.invoiceNo ?? "",
          party_id: invoice.party_id ? String(invoice.party_id) : "",
          invoice_date: fmtDateForInput(invoice.invoice_date ?? invoice.created_at ?? new Date()),
          notes: invoice.notes ?? "",
        });

        // The invoice endpoint may have items: []
        const itemsList = invoice.items ?? [];

        if (Array.isArray(itemsList) && itemsList.length > 0) {
          // Normalize and attempt to auto-match to itemsMaster by id, name, or price
          const normalized = itemsList.map((it) => {
            const qty = Number(it.qty ?? it.quantity ?? 1) || 1;
            const price = Number(it.unit_price ?? it.price ?? it.rate ?? it.sale_price ?? 0) || 0;

            // Candidate id from backend row (may be null/empty)
            let itemId = (it.item_id ?? it.product_id ?? it.itemId ?? "") + "";

            // 1) Try direct match by id
            let master = null;
            if (itemId && itemsMaster.length) {
              master = itemsMaster.find((x) => String(x.id) === String(itemId));
            }

            // 2) If not found, try match by name/description (case-insensitive)
            if (!master && itemsMaster.length) {
              const text = (it.name ?? it.item_name ?? it.description ?? "").toString().trim().toLowerCase();
              if (text) {
                master = itemsMaster.find((m) => (m.name || "").toString().trim().toLowerCase() === text);
              }
            }

            // 3) If still not found, try match by price (sale_price)
            if (!master && itemsMaster.length) {
              const rprice = price || 0;
              if (rprice) {
                master = itemsMaster.find((m) => {
                  const mp = Number(m.sale_price ?? m.price ?? m.rate ?? 0) || 0;
                  return mp && Math.abs(mp - rprice) < 0.0001;
                });
              }
            }

            // If matched, prefer master id
            if (master) {
              itemId = String(master.id);
            }

            const displayName =
              it.name ?? it.item_name ?? master?.name ?? (itemId ? `Item ${itemId} @ ₹${price}` : `Row ${it.id}`);

            return {
              // canonical item id (string) if available
              item_id: itemId,
              qty,
              unit_price: price,
              discount: Number(it.discount ?? 0),
              _searchText: displayName,
            };
          });

          if (!cancelled) setRows(normalized);
        } else {
          // fallback: single empty row
          if (!cancelled) setRows([{ item_id: "", qty: 1, unit_price: 0, discount: 0 }]);
        }
      } catch (err) {
        console.error("Failed to load invoice", err);
        // keep UI usable
        setRows([{ item_id: "", qty: 1, unit_price: 0, discount: 0 }]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [invoiceId, itemsMaster]);

  /* When itemsMaster arrives, fill missing unit_price where possible */
  useEffect(() => {
    if (!itemsMaster || !itemsMaster.length) return;
    setRows((prev) =>
      prev.map((r) => {
        if (r.item_id && (!r.unit_price || Number(r.unit_price) === 0)) {
          const it = itemsMaster.find((x) => String(x.id) === String(r.item_id));
          const price = Number(it?.sale_price ?? it?.price ?? it?.rate ?? 0) || r.unit_price;
          return { ...r, unit_price: price || r.unit_price };
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
    if (saving) return;
    setSaving(true);

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

    if (!invoiceId && lastInvoiceNumeric !== null) {
      const numeric = parseInvoiceNoNumber(form.invoice_no);
      if (Number.isNaN(numeric)) {
        setSaving(false);
        return alert("Invoice number must contain a numeric suffix (e.g. 001).");
      }
      if (numeric !== lastInvoiceNumeric + 1) {
        setSaving(false);
        return alert(
          `Invoice numeric suffix must be previous invoice number +1. Previous: ${String(
            lastInvoiceNumeric
          ).padStart(3, "0")}. Your invoice numeric part should be ${String(lastInvoiceNumeric + 1).padStart(3, "0")}.`
        );
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
      if (typeof onSaved === "function") onSaved(res);
    } catch (err) {
      console.error("Save failed", err);
      alert("Save failed. See console/network/server logs.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    if (typeof onCancel === "function") onCancel();
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="text-lg font-semibold mb-3">{invoiceId ? "Edit Invoice" : "New Invoice"}</h3>
      {loading ? <div className="mb-3">Loading invoice...</div> : null}

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
                        const it = itemsMaster.find((x) => String(x.id) === String(id));
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
                    {/* show readable name under select if select has no value but _searchText exists */}
                    {!r.item_id && r._searchText ? (
                      <div className="text-xs text-gray-600 mt-1">{r._searchText}</div>
                    ) : null}
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
