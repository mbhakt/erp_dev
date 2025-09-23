// src/components/PartyForm.jsx
import React, { useState } from "react";

const GST_TYPES = [
  "Unregistered/Consumer",
  "Regular",
  "Composition",
  "SEZ Supplier",
  "Export",
];

const STATES = [
  "Andhra Pradesh",
  "Karnataka",
  "Kerala",
  "Tamil Nadu",
  "Maharashtra",
  // add the rest as needed
];

export default function PartyForm({ initialData = {}, onSubmit, onCancel, saving }) {
  const emptyForm = {
    name: "",
    gstin: "",
    phone: "",
    gstType: GST_TYPES[0],
    state: "",
    email: "",
    billingAddress: "",
    enableShipping: false,
    shippingAddress: "",
    creditLimit: "",
    openingBalance: "",
    extra: "",
  };

  const [form, setForm] = useState({ ...emptyForm, ...initialData });
  const [activeTab, setActiveTab] = useState("gst");

  function setField(key, value) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function validateForm() {
    if (!form.name || form.name.trim().length < 1) {
      return "Party name is required";
    }
    return null;
  }

  async function handleSave(keepOpen) {
    const vErr = validateForm();
    if (vErr) {
      alert(vErr);
      return;
    }

    const payload = {
      name: form.name.trim(),
      gstin: form.gstin.trim() || null,
      phone: form.phone.trim() || null,
      gst_type: form.gstType,
      state: form.state || null,
      email: form.email || null,
      billing_address: form.billingAddress || null,
      shipping_address: form.enableShipping ? form.shippingAddress : null,
      credit_limit: form.creditLimit ? parseFloat(form.creditLimit) : null,
      opening_balance: form.openingBalance ? parseFloat(form.openingBalance) : null,
      extra: form.extra || null,
    };

    onSubmit && onSubmit(payload, { keepOpen, reset: () => setForm(emptyForm) });
  }

  return (
    <div>
      {/* Top row */}
      <div className="grid grid-cols-12 gap-3 items-center">
        <div className="col-span-5">
          <label className="text-xs text-gray-600">Party Name *</label>
          <input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Party name"
            autoFocus
          />
        </div>

        <div className="col-span-4">
          <label className="text-xs text-gray-600">GSTIN</label>
          <input
            value={form.gstin}
            onChange={(e) => setField("gstin", e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="GSTIN"
          />
        </div>

        <div className="col-span-3">
          <label className="text-xs text-gray-600">Phone Number</label>
          <input
            value={form.phone}
            onChange={(e) => setField("phone", e.target.value)}
            className="w-full border rounded px-3 py-2 mt-1"
            placeholder="Phone"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-4">
        <nav className="flex items-center gap-4 border-b">
          <button
            className={`pb-2 ${activeTab === "gst" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("gst")}
          >
            GST & Address
          </button>
          <button
            className={`pb-2 ${activeTab === "credit" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("credit")}
          >
            Credit & Balance
          </button>
          <button
            className={`pb-2 ${activeTab === "extra" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600"}`}
            onClick={() => setActiveTab("extra")}
          >
            Additional Fields
          </button>
        </nav>

        <div className="mt-4 grid grid-cols-2 gap-6">
          {activeTab === "gst" && (
            <>
              <div>
                <label className="text-xs text-gray-600">GST Type</label>
                <select
                  value={form.gstType}
                  onChange={(e) => setField("gstType", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  {GST_TYPES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>

                <label className="text-xs text-gray-600 mt-3 block">State</label>
                <select
                  value={form.state}
                  onChange={(e) => setField("state", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                >
                  <option value="">Select state</option>
                  {STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <label className="text-xs text-gray-600 mt-3 block">Email ID</label>
                <input
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="text-xs text-gray-600">Billing Address</label>
                <textarea
                  value={form.billingAddress}
                  onChange={(e) => setField("billingAddress", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1 h-32"
                  placeholder="Billing address"
                />

                <div className="mt-2 flex items-center gap-2">
                  <input
                    id="ship-toggle"
                    type="checkbox"
                    checked={form.enableShipping}
                    onChange={(e) => setField("enableShipping", e.target.checked)}
                    className="mt-1"
                  />
                  <label htmlFor="ship-toggle" className="text-sm text-gray-600">
                    Enable Shipping Address
                  </label>
                </div>

                {form.enableShipping && (
                  <textarea
                    value={form.shippingAddress}
                    onChange={(e) => setField("shippingAddress", e.target.value)}
                    className="w-full border rounded px-3 py-2 mt-2 h-20"
                    placeholder="Shipping address"
                  />
                )}
              </div>
            </>
          )}

          {activeTab === "credit" && (
            <>
              <div>
                <label className="text-xs text-gray-600">Credit Limit</label>
                <input
                  value={form.creditLimit}
                  onChange={(e) => setField("creditLimit", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="0.00"
                  type="number"
                />

                <label className="text-xs text-gray-600 mt-3 block">Opening Balance</label>
                <input
                  value={form.openingBalance}
                  onChange={(e) => setField("openingBalance", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="0.00"
                  type="number"
                />
              </div>

              <div>
                <div className="text-sm text-gray-600 mb-2">Quick notes</div>
                <textarea
                  value={form.extra}
                  onChange={(e) => setField("extra", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1 h-40"
                  placeholder="Notes about this party (internal)"
                />
              </div>
            </>
          )}

          {activeTab === "extra" && (
            <>
              <div>
                <label className="text-xs text-gray-600">Custom Field 1</label>
                <input
                  value={form.extra}
                  onChange={(e) => setField("extra", e.target.value)}
                  className="w-full border rounded px-3 py-2 mt-1"
                  placeholder="Anything"
                />
              </div>
              <div />
            </>
          )}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="mt-6 flex justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-50"
          disabled={saving}
        >
          Cancel
        </button>
        <button
          onClick={() => handleSave(true)}
          className="px-4 py-2 border rounded hover:bg-gray-50"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save & New"}
        </button>
        <button
          onClick={() => handleSave(false)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={saving}
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
