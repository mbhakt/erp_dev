// src/components/InvoiceForm.jsx
import React, { useEffect, useState } from "react";
import { fetchParties, fetchItems, createInvoice, updateInvoice } from "../api";
import { useNavigate } from "react-router-dom";

/**
 * InvoiceForm
 *
 * Props (all optional):
 *  - invoice: object  (if provided, form will populate for editing; should contain id, invoice_no, party_id, invoice_date, items[])
 *  - onSave: fn       (callback(createdOrUpdatedInvoice) - optional; called after successful save)
 *  - onClose: fn      (optional; when used as modal)
 *
 * If no invoice prop is passed this component acts as a standalone page (navigates back on save).
 */
export default function InvoiceForm({ invoice = null, onSave = null, onClose = null }) {
  const [parties, setParties] = useState([]);
  const [itemsList, setItemsList] = useState([]);

  const [form, setForm] = useState({
    id: invoice?.id || null,
    invoice_no: invoice?.invoice_no || `INV-${Date.now()}`,
    party_id: invoice?.party_id ?? "",
    invoice_date: invoice?.invoice_date ? dateToInput(invoice.invoice_date) : new Date().toISOString().slice(0, 10),
    notes: invoice?.notes || "",
  });

  const [rows, setRows] = useState(
    invoice?.items?.length
      ? invoice.items.map(it => ({
          id: it.id || null,
          item_id: it.item_id ?? null,
          item_name: it.item_name || it.name || "",
          qty: Number(it.qty || 1),
          unit_price: Number(it.unit_price ?? it.price ?? 0),
          discount: Number(it.discount ?? 0),
        }))
      : [{ item_id: "", item_name: "", qty: 1, unit_price: 0, discount: 0 }]
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchParties().then(setParties).catch(err => {
      console.error("fetchParties failed", err);
    });
    fetchItems().then(setItemsList).catch(err => {
      console.error("fetchItems failed", err);
    });
  }, []);

  // If the invoice prop changes after mount, update the form
  useEffect(() => {
    if (invoice) {
      setForm({
        id: invoice.id || null,
        invoice_no: invoice.invoice_no || `INV-${Date.now()}`,
        party_id: invoice.party_id ?? "",
        invoice_date: invoice.invoice_date ? dateToInput(invoice.invoice_date) : new Date().toISOString().slice(0, 10),
        notes: invoice.notes || "",
      });
      setRows(
        (invoice.items || []).map(it => ({
          id: it.id || null,
          item_id: it.item_id ?? null,
          item_name: it.item_name || it.name || "",
          qty: Number(it.qty || 1),
          unit_price: Number(it.unit_price ?? it.price ?? 0),
          discount: Number(it.discount ?? 0),
        }))
      );
    }
  }, [invoice]);

  // helpers
  function dateToInput(d) {
    if (!d) return "";
    // Accept d as 'YYYY-MM-DD' or full ISO; convert to YYYY-MM-DD
    const dt = new Date(d);
    if (isNaN(dt.getTime())) {
      // fallback: try slicing if already 'YYYY-MM-DD'
      return String(d).slice(0, 10);
    }
    return dt.toISOString().slice(0, 10);
  }

  function updateRow(idx, changes) {
    setRows(prev => prev.map((r, i) => (i === idx ? { ...r, ...changes } : r)));
  }
  function addRow() {
    setRows(prev => [...prev, { item_id: "", item_name: "", qty: 1, unit_price: 0, discount: 0 }]);
  }
  function removeRow(idx) {
    setRows(prev => prev.filter((_, i) => i !== idx));
  }

  function setField(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function validate() {
    if (!form.invoice_no || form.invoice_no.trim() === "") {
      setError("Invoice number is required.");
      return false;
    }
    if (!form.party_id) {
      setError("Select a party.");
      return false;
    }
    if (!rows || rows.length === 0) {
      setError("Add at least one item.");
      return false;
    }
    for (let i = 0; i < rows.length; i++) {
      const r = rows[i];
      if (!r.item_id && !r.item_name) {
        setError(`Choose an item for row ${i + 1}`);
        return false;
      }
      if (!r.qty || Number(r.qty) <= 0) {
        setError(`Quantity must be > 0 for row ${i + 1}`);
        return false;
      }
    }
    setError("");
    return true;
  }

  async function save(e) {
    e?.preventDefault?.();
    if (!validate()) return;

    const itemsPayload = rows.map(r => ({
      item_id: r.item_id ? Number(r.item_id) : null,
      // include name too for DB schemas that use name column
      name: r.item_name || undefined,
      qty: Number(r.qty),
      unit_price: Number(r.unit_price || 0),
      discount: Number(r.discount || 0),
    }));

    // compute total (server will also compute, but helpful to include)
    const total = itemsPayload.reduce((s, it) => s + ((it.unit_price || 0) * (it.qty || 0) - (it.discount || 0)), 0);

    const payload = {
      invoice_no: form.invoice_no,
      party_id: Number(form.party_id),
      invoice_date: form.invoice_date,
      notes: form.notes || "",
      items: itemsPayload,
      total, // optional
    };

    setSaving(true);
    setError("");
    try {
      let result;
      if (form.id) {
        // update
        result = await updateInvoice(form.id, payload);
      } else {
        result = await createInvoice(payload);
      }

      // call parent callback if provided
      if (typeof onSave === "function") onSave(result);

      // if used as modal, close via onClose
      if (typeof onClose === "function") {
        onClose();
      } else {
        // otherwise navigate back to invoices list (adjust path if needed)
        navigate("/invoices");
      }
    } catch (err) {
      console.error("Save invoice failed:", err);
      // axios error typically has response.data
      let msg = "Failed to save invoice";
      if (err?.response?.data) {
        msg = err.response.data.error || JSON.stringify(err.response.data);
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      // also keep alert for immediate user feedback
      alert(msg);
    } finally {
      setSaving(false);
    }
  }

  // autofill unit_price when an item is selected from itemsList
  function handleItemSelect(idx, value) {
    const selected = itemsList.find(it => String(it.id) === String(value));
    if (selected) {
      updateRow(idx, { item_id: selected.id, item_name: selected.name, unit_price: Number(selected.sale_price ?? selected.purchase_price ?? selected.price ?? 0) });
    } else {
      updateRow(idx, { item_id: value, item_name: "", unit_price: 0 });
    }
  }

  return (
    <form onSubmit={save} className="p-6 bg-white rounded shadow">
      <div className="flex justify-between items-start mb-4">
        <h2 className="text-xl font-semibold">{form.id ? "Edit Invoice" : "New Invoice"}</h2>
        {typeof onClose === "function" && (
          <button type="button" onClick={onClose} className="text-sm text-gray-600">Close</button>
        )}
      </div>

      {error && <div className="mb-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm text-gray-600">Invoice No</label>
          <input className="mt-1 p-2 border rounded w-full" value={form.invoice_no} onChange={e => setField("invoice_no", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Date</label>
          <input type="date" className="mt-1 p-2 border rounded w-full" value={form.invoice_date} onChange={e => setField("invoice_date", e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-gray-600">Party</label>
          <select className="mt-1 p-2 border rounded w-full" value={form.party_id} onChange={e => setField("party_id", e.target.value)}>
            <option value="">-- Select Party --</option>
            {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-gray-600">Notes</label>
          <input className="mt-1 p-2 border rounded w-full" value={form.notes} onChange={e => setField("notes", e.target.value)} />
        </div>
      </div>

      <div className="mb-4">
        <table className="min-w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Item</th>
              <th className="p-2 border">Qty</th>
              <th className="p-2 border">Rate</th>
              <th className="p-2 border">Discount</th>
              <th className="p-2 border">Amount</th>
              <th className="p-2 border"> </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => {
              const amount = (Number(r.unit_price || 0) * Number(r.qty || 0)) - Number(r.discount || 0);
              return (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="p-2 border">
                    <select className="w-full p-1 border rounded" value={r.item_id ?? r.item_name} onChange={e => handleItemSelect(idx, e.target.value)}>
                      <option value="">-- select item --</option>
                      {itemsList.map(it => (
                        <option key={it.id} value={it.id}>{it.name} ({it.sku || ""})</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-2 border">
                    <input className="w-20 p-1 border rounded" type="number" min="0" value={r.qty} onChange={e => updateRow(idx, { qty: Number(e.target.value) })} />
                  </td>

                  <td className="p-2 border">
                    <input className="w-28 p-1 border rounded" type="number" min="0" step="0.01" value={r.unit_price} onChange={e => updateRow(idx, { unit_price: Number(e.target.value) })} />
                  </td>

                  <td className="p-2 border">
                    <input className="w-28 p-1 border rounded" type="number" min="0" step="0.01" value={r.discount} onChange={e => updateRow(idx, { discount: Number(e.target.value) })} />
                  </td>

                  <td className="p-2 border">
                    ₹ {amount.toFixed(2)}
                  </td>

                  <td className="p-2 border">
                    <button type="button" className="px-2 py-1 text-sm text-red-600" onClick={() => removeRow(idx)}>Remove</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="mt-2">
          <button type="button" className="px-3 py-1 bg-gray-100 rounded" onClick={addRow}>+ Add line</button>
        </div>
      </div>

      <div className="flex justify-end items-center gap-3">
        <button type="button" className="px-3 py-2 border rounded" onClick={() => { if (typeof onClose === "function") onClose(); else navigate(-1); }}>Cancel</button>
        <button type="submit" disabled={saving} className="px-4 py-2 bg-green-600 text-white rounded">
          {saving ? "Saving..." : form.id ? "Update Invoice" : "Save Invoice"}
        </button>
      </div>
    </form>
  );
}
