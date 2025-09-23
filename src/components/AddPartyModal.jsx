// src/components/AddPartyModal.jsx
import React, { useState } from "react";
import { createParty, updateParty } from "../api";

export default function AddPartyModal({ open, onClose, onSaved, initial = null }) {
  const [name, setName] = useState(initial?.name || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [address, setAddress] = useState(initial?.address || "");
  const [gstin, setGstin] = useState(initial?.gstin || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const disabled = !name || submitting;

  async function submit(e) {
    e?.preventDefault?.();
    if (disabled) return;
    setSubmitting(true);
    setError("");

    try {
      const payload = {
        name,
        phone: phone || null,
        email: email || null,
        address: address || null,
        gstin: gstin || null,
      };

      let saved;
      if (initial?.id) {
        saved = await updateParty(initial.id, payload);
      } else {
        saved = await createParty(payload);
      }

      if (typeof onSaved === "function") onSaved(saved);

      // reset and close
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      setGstin("");
      onClose();
    } catch (err) {
      console.error("Save error:", err);
      setError(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative z-50 w-[520px] bg-white rounded shadow p-4"
      >
        <h3 className="text-lg font-semibold mb-3">
          {initial ? "Edit Party" : "Add Party"}
        </h3>

        {error && <div className="mb-2 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-gray-600">Party Name</label>
            <input
              className="w-full border rounded p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Phone</label>
            <input
              className="w-full border rounded p-2"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Email</label>
            <input
              className="w-full border rounded p-2"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">Billing Address</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600">GSTIN</label>
            <input
              value={gstin}
              onChange={(e) => setGstin(e.target.value)}
              className="w-full border rounded p-2"
            />
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2">
          <button
            type="button"
            className="px-3 py-2 border rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={disabled}
            className="px-3 py-2 rounded bg-blue-600 text-white"
          >
            {submitting ? "Saving…" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
