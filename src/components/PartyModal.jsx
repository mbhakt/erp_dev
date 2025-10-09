import React, { useEffect, useState } from "react";

/**
 * Props:
 * - open (bool)
 * - onClose (fn)
 * - party (object | null)
 * - onSave (fn) -> called with { name, address, city, phone, gst }
 * - saving (bool)
 */
export default function PartyModal({ open, onClose, party, onSave, saving }) {
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "", gst: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (open) {
      setForm({
        name: party?.name || "",
        address: party?.address || "",
        city: party?.city || "",
        phone: party?.phone || "",
        gst: party?.gst || "",
      });
      setErrors({});
    }
  }, [open, party]);

  if (!open) return null;

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name required";
    // optional: validate phone/gst formats
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    await onSave({
      name: form.name.trim(),
      address: form.address.trim() || undefined,
      city: form.city.trim() || undefined,
      phone: form.phone.trim() || undefined,
      gst: form.gst.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white rounded shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{party ? "Edit Party" : "Add Party"}</h3>
          <button type="button" onClick={() => !saving && onClose()} className="text-gray-500">✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              placeholder="Name"
              autoFocus
            />
            {errors.name && <div className="text-red-600 text-sm mt-1">{errors.name}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">City</label>
            <input
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              placeholder="City"
            />
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium">Address</label>
            <input
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              placeholder="Address"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              placeholder="Phone"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">GST / Tax ID</label>
            <input
              value={form.gst}
              onChange={(e) => setForm((f) => ({ ...f, gst: e.target.value }))}
              className="w-full border px-3 py-2 rounded"
              placeholder="GST / Tax ID"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => !saving && onClose()} className="px-4 py-2 rounded border" disabled={saving}>Cancel</button>
          <button type="submit" className={`px-4 py-2 rounded text-white ${saving ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"}`} disabled={saving}>
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}