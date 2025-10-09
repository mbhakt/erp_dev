// src/components/AddPartyModal.jsx
import React, { useEffect, useState } from "react";
import { createParty, updateParty } from '../api'; // your api functions

export default function AddPartyModal({ open, initial = null, onClose, onSave }) {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    gstin: "",
    type: "",
    balance: 0,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name || "",
        phone: initial.phone || "",
        email: initial.email || "",
        address: initial.address || "",
        gstin: initial.gstin || "",
        type: initial.type || "",
        balance: initial.balance != null ? initial.balance : 0,
      });
    } else {
      setForm({
        name: "",
        phone: "",
        email: "",
        address: "",
        gstin: "",
        type: "",
        balance: 0,
      });
    }
  }, [initial, open]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      if (initial && initial.id) {
        const updated = await updateParty(initial.id, form);
        onSave && onSave(updated);
      } else {
        const created = await createParty(form);
        onSave && onSave(created);
      }
      onClose && onClose();
    } catch (err) {
      console.error("Party save failed:", err);
      alert("Failed to save party: " + (err?.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/40">
      <div className="bg-white rounded shadow-xl w-[640px] p-6">
        <h3 className="text-lg font-semibold mb-4">{initial ? "Edit Party" : "Add Party"}</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input
              placeholder="Name"
              className="border p-2"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
            <input
              placeholder="Phone"
              className="border p-2"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
            <input
              placeholder="Email"
              className="border p-2"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              placeholder="GSTIN"
              className="border p-2"
              value={form.gstin}
              onChange={(e) => setForm({ ...form, gstin: e.target.value })}
            />
            <input
              placeholder="Address"
              className="border p-2 col-span-2"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
            <select
              className="border p-2"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              <option value="">-- Select --</option>
              <option value="customer">Customer</option>
              <option value="supplier">Supplier</option>
              <option value="other">Other</option>
            </select>

            <div>
              <label className="block text-sm text-slate-600">Balance</label>
              <input
                type="number"
                step="0.01"
                className="border p-2 w-full"
                value={form.balance}
                onChange={(e) => setForm({ ...form, balance: Number(e.target.value) })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-4">
            <button type="button" className="px-4 py-2 border" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>
              {initial ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}