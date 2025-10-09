// AddItemModalFull.jsx
import React, { useState } from "react";

/**
 * Full Add Item modal (the bigger pink / page-like one shown by the Add Item button).
 * Props: onClose, onSaved
 */
export default function AddItemModalFull({ onClose, onSaved }) {
  const [tab, setTab] = useState("pricing");
  const [form, setForm] = useState({
    name: "",
    hsn: "",
    unit: "",
    salePrice: "",
    purchasePrice: "",
  });
  const [saving, setSaving] = useState(false);

  const handle = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      // call API
      await new Promise((r) => setTimeout(r, 800));
      const created = { id: Date.now(), ...form };
      onSaved && onSaved(created);
      onClose && onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6" aria-modal="true" role="dialog">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded shadow-xl overflow-hidden z-10">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-semibold">Add Item</h3>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <input
              className="col-span-2 border rounded px-3 py-2"
              placeholder="Item Name *"
              value={form.name}
              onChange={handle("name")}
            />
            <div className="flex items-center justify-end gap-2">
              <button className="px-3 py-2 border rounded text-sm">Add Image</button>
            </div>

            <input placeholder="Item HSN" className="border rounded px-3 py-2" value={form.hsn} onChange={handle("hsn")} />
            <input placeholder="Unit" className="border rounded px-3 py-2" value={form.unit} onChange={handle("unit")} />
            <div /> {/* empty cell */}
          </div>

          <div>
            <div className="flex items-center space-x-4 border-b">
              <button
                onClick={() => setTab("pricing")}
                className={`py-2 px-3 -mb-px ${tab === "pricing" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}
              >
                Pricing
              </button>
              <button
                onClick={() => setTab("stock")}
                className={`py-2 px-3 -mb-px ${tab === "stock" ? "border-b-2 border-blue-600 text-blue-600" : "text-slate-500"}`}
              >
                Stock
              </button>
            </div>

            {tab === "pricing" && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                <input placeholder="Sale Price" className="border rounded px-3 py-2" value={form.salePrice} onChange={handle("salePrice")} />
                <div className="flex items-center gap-3">
                  <select className="border rounded px-3 py-2">
                    <option>Without Tax</option>
                    <option>With Tax</option>
                  </select>
                </div>

                <input placeholder="Purchase Price" className="border rounded px-3 py-2" value={form.purchasePrice} onChange={handle("purchasePrice")} />
                <div className="p-3 bg-slate-50 rounded">
                  <div className="text-sm text-slate-500">Stock Quantity</div>
                  <div className="text-lg font-semibold">0</div>
                </div>
              </div>
            )}

            {tab === "stock" && (
              <div className="mt-4">
                <p className="text-sm text-slate-500">Stock controls & locations would go here.</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t bg-slate-50">
          <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
          <button onClick={save} disabled={saving} className="px-4 py-2 rounded bg-blue-600 text-white">
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}