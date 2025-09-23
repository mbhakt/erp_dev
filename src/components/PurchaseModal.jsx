// src/components/PurchaseModal.jsx
import React, { useEffect, useState } from "react";
 import {
  createPurchase,
  updatePurchase,
} from "../api";

export default function PurchaseModal({
  open = true,
  onClose = () => {},
  purchase = null,
  onSaved = () => {},
}) {
  const [form, setForm] = useState({
    vendor_id: null,
    vendor_name: "",
    bill_no: "",
    bill_date: new Date().toISOString().slice(0, 10),
    notes: "",
    items: [
      { description: "", item_id: null, qty: 1, rate: 0, tax_percent: 0 },
    ],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (purchase) {
      setForm({
        vendor_id: purchase.vendor_id ?? null,
        vendor_name: purchase.vendor_name ?? "",
        bill_no: purchase.bill_no ?? "",
        bill_date: purchase.bill_date
          ? purchase.bill_date.slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        notes: purchase.notes ?? "",
        items: (purchase.items || []).map((it) => ({
          item_id: it.item_id ?? null,
          description: it.description ?? it.item_name ?? "",
          qty: Number(it.qty || 0),
          rate: Number(it.rate || 0),
          tax_percent: Number(it.tax_percent || 0),
        })),
      });
    } else {
      setForm((f) => ({
        ...f,
        bill_date: new Date().toISOString().slice(0, 10),
      }));
    }
  }, [purchase]);

  function updateItem(idx, partial) {
    setForm((prev) => {
      const items = prev.items.slice();
      items[idx] = { ...items[idx], ...partial };
      return { ...prev, items };
    });
  }

  function addItem() {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { description: "", item_id: null, qty: 1, rate: 0, tax_percent: 0 },
      ],
    }));
  }

  function removeItem(idx) {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  }

  function setField(k, v) {
    setForm((prev) => ({ ...prev, [k]: v }));
  }

  function validate() {
    if (!form.bill_no || form.bill_no.trim() === "") {
      setError("Bill number is required.");
      return false;
    }
    if (!form.items || form.items.length === 0) {
      setError("Add at least one line item.");
      return false;
    }
    for (const it of form.items) {
      if (!it.description || it.description.trim() === "") {
        setError("Every line item needs a description.");
        return false;
      }
      if (Number(it.qty) <= 0) {
        setError("Item quantity must be > 0");
        return false;
      }
    }
    setError("");
    return true;
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    if (!validate()) return;

    setSaving(true);
    setError("");
    try {
      const payload = {
        vendor_id: form.vendor_id,
        vendor_name: form.vendor_name,
        bill_no: form.bill_no,
        bill_date: form.bill_date,
        notes: form.notes,
        items: form.items.map((it) => ({
          item_id: it.item_id ?? null,
          description: it.description,
          qty: Number(it.qty),
          rate: Number(it.rate),
          tax_percent: Number(it.tax_percent ?? 0),
        })),
      };

      let saved;
      if (purchase && purchase.id) {
        saved = await updatePurchase(purchase.id, payload);
      } else {
        saved = await createPurchase(payload);
      }

      onSaved(saved);
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form
        onSubmit={handleSave}
        className="relative z-10 bg-white rounded-lg shadow-xl w-[960px] max-w-full p-6"
      >
        <div className="flex justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {purchase ? "Edit Purchase" : "Add Purchase"}
          </h3>
          <button type="button" onClick={onClose} className="text-gray-600">
            Close
          </button>
        </div>

        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="block text-sm text-gray-600">Bill No</label>
            <input
              className="mt-1 p-2 border rounded w-full"
              value={form.bill_no}
              onChange={(e) => setField("bill_no", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Vendor Name</label>
            <input
              className="mt-1 p-2 border rounded w-full"
              value={form.vendor_name}
              onChange={(e) => setField("vendor_name", e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Bill Date</label>
            <input
              className="mt-1 p-2 border rounded w-full"
              type="date"
              value={form.bill_date}
              onChange={(e) => setField("bill_date", e.target.value)}
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600 mb-2">Line Items</label>
          <div className="space-y-3">
            {form.items.map((it, idx) => (
              <div key={idx} className="flex gap-2 items-start">
                <input
                  placeholder="Description"
                  className="flex-1 p-2 border rounded"
                  value={it.description}
                  onChange={(e) =>
                    updateItem(idx, { description: e.target.value })
                  }
                />
                <input
                  className="w-20 p-2 border rounded"
                  type="number"
                  min="0"
                  step="1"
                  value={it.qty}
                  onChange={(e) => updateItem(idx, { qty: e.target.value })}
                />
                <input
                  className="w-28 p-2 border rounded"
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.rate}
                  onChange={(e) => updateItem(idx, { rate: e.target.value })}
                />
                <input
                  className="w-24 p-2 border rounded"
                  type="number"
                  min="0"
                  step="0.01"
                  value={it.tax_percent}
                  onChange={(e) =>
                    updateItem(idx, { tax_percent: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="text-sm text-red-600"
                  onClick={() => removeItem(idx)}
                >
                  Remove
                </button>
              </div>
            ))}
            <div>
              <button
                type="button"
                className="text-sm text-blue-600"
                onClick={addItem}
              >
                + Add line
              </button>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm text-gray-600">Notes</label>
          <textarea
            className="w-full p-2 border rounded"
            rows={3}
            value={form.notes}
            onChange={(e) => setField("notes", e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
