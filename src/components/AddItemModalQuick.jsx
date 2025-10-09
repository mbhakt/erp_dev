// AddItemModalQuick.jsx
import React, { useState } from "react";

/**
 * Small/quick modal used by sidebar + button (yellow). Keep it minimal.
 * Props:
 *  - open: boolean (ignored because host controls rendering)
 *  - onClose: fn
 *  - onSaved: fn (optional)
 */
export default function AddItemModalQuick({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    price: "",
    unit: "",
    hsn: "",
  });
  const [saving, setSaving] = useState(false);

  const handle = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      // call your API here, example:
      // const created = await createItem(form);
      // For now simulate:
      await new Promise((r) => setTimeout(r, 600));
      const created = { id: Date.now(), ...form };
      onSaved && onSaved(created);
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-6"
      aria-modal="true"
      role="dialog"
    >
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded shadow-lg overflow-hidden z-10">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="text-lg font-semibold">Add Item</h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              value={form.name}
              onChange={handle("name")}
              placeholder="Item Name *"
              className="border rounded px-3 py-2 w-full"
            />
            <input value={form.sku} onChange={handle("sku")} placeholder="SKU" className="border rounded px-3 py-2 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input value={form.price} onChange={handle("price")} placeholder="Price" className="border rounded px-3 py-2 w-full" />
            <input value={form.unit} onChange={handle("unit")} placeholder="Unit" className="border rounded px-3 py-2 w-full" />
          </div>

          <input value={form.hsn} onChange={handle("hsn")} placeholder="HSN / SAC" className="border rounded px-3 py-2 w-full" />

        </div>

        <div className="flex items-center justify-end gap-3 px-4 py-3 border-t bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 rounded border text-sm">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white text-sm">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}