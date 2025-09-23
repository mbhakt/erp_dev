// src/components/AddItemModal.jsx
import React, { useState } from "react";

/**
 * Small modal wrapper + AddItemForm.
 * Replace AddItemForm internals with your real fields & API calls.
 */

function ModalShell({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start md:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded shadow-lg w-full max-w-2xl mx-auto overflow-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">✕</button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}

export function AddItemForm({ initialData = {}, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    sku: initialData.sku || "",
    price: initialData.price ?? "",
    unit: initialData.unit || "",
    hsn: initialData.hsn || "",
    ...initialData,
  });

  const setField = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // basic validation
    if (!form.name || !form.name.trim()) {
      alert("Item name is required");
      return;
    }
    // convert numbers
    const payload = {
      name: form.name.trim(),
      sku: form.sku.trim() || null,
      price: form.price === "" ? null : Number(String(form.price).replace(/,/g, "")),
      unit: form.unit || null,
      hsn: form.hsn || null,
    };
    onSave && onSave(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-gray-600">Item Name *</label>
          <input value={form.name} onChange={setField("name")} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">SKU</label>
          <input value={form.sku} onChange={setField("sku")} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Price</label>
          <input value={form.price} onChange={setField("price")} className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-xs text-gray-600">Unit</label>
          <input value={form.unit} onChange={setField("unit")} className="w-full border rounded px-3 py-2" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs text-gray-600">HSN / SAC</label>
          <input value={form.hsn} onChange={setField("hsn")} className="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={onCancel} className="px-4 py-2 border rounded text-gray-600">Cancel</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{saving ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

export default function AddItemModal({ open, onClose, onSaved }) {
  const [saving, setSaving] = useState(false);

  const handleSave = async (payload) => {
    setSaving(true);
    try {
      // TODO: call your createItem API here, e.g.
      // const created = await createItem(payload);
      // onSaved(created);
      // For now we simulate and return the payload with an id
      const created = { id: Date.now(), ...payload };
      onSaved && onSaved(created);
      onClose && onClose();
    } catch (err) {
      console.error("save item failed", err);
      alert("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;
  return (
    <ModalShell title="Add Item" onClose={onClose}>
      <AddItemForm onSave={handleSave} onCancel={onClose} saving={saving} />
    </ModalShell>
  );
}
