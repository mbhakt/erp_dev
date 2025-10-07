// src/components/ItemForm.jsx
import React, { useEffect, useState } from "react";

/**
 * ItemForm
 *
 * Props:
 * - initial: (optional) existing item object to edit. If missing, the form is for "create".
 * - onSaved: function(item) called after successful save (receives created/updated item)
 * - onCancel: optional callback when user cancels
 *
 * The component expects backend fields:
 *   sku, name, description, unit, sale_price, purchase_price, qty_in_stock
 *
 * Uses fetch() to POST /api/items or PUT /api/items/:id
 */
export default function ItemForm({ initial = null, onSaved = () => {}, onCancel = () => {} }) {
  const empty = {
    sku: "",
    name: "",
    description: "",
    unit: "",
    sale_price: "",
    purchase_price: "",
    qty_in_stock: "",
  };

  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // populate when initial changes
  useEffect(() => {
    if (initial && typeof initial === "object") {
      setForm({
        sku: initial.sku ?? "",
        name: initial.name ?? "",
        description: initial.description ?? "",
        unit: initial.unit ?? "",
        sale_price: initial.sale_price ?? "",
        purchase_price: initial.purchase_price ?? "",
        // important: use qty_in_stock (backend field)
        qty_in_stock: initial.qty_in_stock ?? initial.stock_qty ?? "",
      });
    } else {
      setForm(empty);
    }
    setError(null);
  }, [initial]);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validate() {
    if (!form.name || !String(form.name).trim()) {
      return "Item name is required.";
    }
    // sale_price and purchase_price should be numbers (allow blank -> 0)
    const sp = form.sale_price === "" ? 0 : Number(form.sale_price);
    const pp = form.purchase_price === "" ? 0 : Number(form.purchase_price);
    if (Number.isNaN(sp) || Number.isNaN(pp)) {
      return "Price fields must be valid numbers.";
    }
    const qty = form.qty_in_stock === "" ? 0 : Number(form.qty_in_stock);
    if (Number.isNaN(qty)) return "Qty in stock must be a number.";
    return null;
  }

  async function handleSave(e) {
    e?.preventDefault?.();
    const vErr = validate();
    if (vErr) {
      setError(vErr);
      return;
    }

    setSaving(true);
    setError(null);

    // payload with normalized numeric fields
    const payload = {
      sku: form.sku ? String(form.sku).trim() : null,
      name: String(form.name).trim(),
      description: form.description || null,
      unit: form.unit ? String(form.unit).trim() : null,
      sale_price: Number(form.sale_price || 0),
      purchase_price: Number(form.purchase_price || 0),
      qty_in_stock: Number(form.qty_in_stock || 0),
    };

    try {
      let res;
      if (initial && initial.id) {
        // update
        res = await fetch(`/api/items/${encodeURIComponent(initial.id)}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        // create
        res = await fetch(`/api/items`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        // try to extract server error message
        let text = await res.text();
        try {
          const j = JSON.parse(text);
          setError(j.error || j.message || `Save failed: ${res.status}`);
        } catch {
          setError(`Save failed: ${res.status} ${res.statusText}`);
        }
        setSaving(false);
        return;
      }

      const data = await res.json();
      // call parent callback with returned object. If server returns nested shape, user can adapt.
      onSaved(data);
    } catch (err) {
      console.error("Item save error:", err);
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-4">
      {error && (
        <div className="text-red-700 bg-red-100 px-3 py-2 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Item Name</label>
          <input
            className="mt-1 block w-full border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Item name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">SKU / Code</label>
          <input
            className="mt-1 block w-full border rounded px-3 py-2"
            value={form.sku}
            onChange={(e) => update("sku", e.target.value)}
            placeholder="SKU"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Unit</label>
          <input
            className="mt-1 block w-full border rounded px-3 py-2"
            value={form.unit}
            onChange={(e) => update("unit", e.target.value)}
            placeholder="pcs / kg / m"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Sale Price</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={form.sale_price}
            onChange={(e) => update("sale_price", e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Purchase Price</label>
          <input
            type="number"
            step="0.01"
            className="mt-1 block w-full border rounded px-3 py-2"
            value={form.purchase_price}
            onChange={(e) => update("purchase_price", e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Qty in stock</label>
        <input
          type="number"
          step="1"
          className="mt-1 block w-40 border rounded px-3 py-2"
          value={form.qty_in_stock}
          onChange={(e) => update("qty_in_stock", e.target.value)}
          placeholder="0"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          className="mt-1 block w-full border rounded px-3 py-2"
          value={form.description || ""}
          onChange={(e) => update("description", e.target.value)}
          rows={3}
          placeholder="Optional description"
        />
      </div>

      <div className="flex items-center space-x-3">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {saving ? "Saving..." : "Save"}
        </button>

        <button
          type="button"
          onClick={() => onCancel()}
          className="inline-flex items-center px-3 py-2 border rounded"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
