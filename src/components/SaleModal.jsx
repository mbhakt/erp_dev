// src/components/SaleModal.jsx
import React, { useState } from "react";
import Modal from "./ui/Modal";

export default function SaleModal({ open, onClose, onSaved }) {
  const [form, setForm] = useState({
    customer: "",
    phone: "",
    items: [{ name: "", qty: 0, unit: "", price: 0, discount: 0, tax: 0 }],
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // for now, just log
    console.log("Sale saved", form);
    if (onSaved) onSaved(form);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="New Sale">
      <div className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Customer</label>
          <input
            value={form.customer}
            onChange={(e) => handleChange("customer", e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        {/* Items table skeleton */}
        <div>
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-2 text-left">Item</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Price</th>
                <th className="p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((it, idx) => (
                <tr key={idx}>
                  <td className="p-2">
                    <input
                      value={it.name}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx].name = e.target.value;
                        setForm((prev) => ({ ...prev, items }));
                      }}
                      className="border rounded px-2 py-1 w-full"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={it.qty}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx].qty = e.target.value;
                        setForm((prev) => ({ ...prev, items }));
                      }}
                      className="border rounded px-2 py-1 w-16"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="number"
                      value={it.price}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx].price = e.target.value;
                        setForm((prev) => ({ ...prev, items }));
                      }}
                      className="border rounded px-2 py-1 w-20"
                    />
                  </td>
                  <td className="p-2 text-right">
                    ₹ {(it.qty * it.price).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
