import React, { useEffect, useState } from "react";

/**
 * Props:
 * - open (bool)
 * - onClose (fn)
 * - item (object | null)   // existing item when editing
 * - onSave (fn) -> called with { name, code, rate, unit } (no id)
 * - saving (bool)
 */
export default function ItemModal({ open, onClose, item, onSave, saving }) {
  const [form, setForm] = useState({ name: "", code: "", rate: "", unit: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        name: item?.name || "",
        code: item?.code || "",
        rate: item?.rate ?? "",
        unit: item?.unit || "",
      });
      setErrors({});
    }
  }, [open, item]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    if (form.rate === "" || isNaN(Number(form.rate))) e.rate = "Valid rate required";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    // prepare payload
    const payload = {
      name: form.name.trim(),
      code: form.code.trim() || undefined,
      rate: Number(form.rate),
      unit: form.unit.trim() || undefined,
    };
    await onSave(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{item ? "Edit Item" : "Add Item"}</h3>
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              placeholder="Item name"
              autoFocus
            />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium">Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                className="w-full border px-3 py-2 rounded"
                placeholder="SKU / code"
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Unit</label>
              <input
                value={form.unit}
                onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                className="w-full border px-3 py-2 rounded"
                placeholder="e.g. pcs, kg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Rate</label>
            <input
              value={form.rate}
              onChange={(e) => setForm((f) => ({ ...f, rate: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              placeholder="0.00"
              inputMode="decimal"
            />
            {errors.rate && <div className="text-red-600 text-sm mt-1">{errors.rate}</div>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => !saving && onClose()}
            className="px-4 py-2 rounded border"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
