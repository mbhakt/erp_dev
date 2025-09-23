// src/components/ItemForm.jsx
import React, { useEffect, useState } from "react";
import { X, Settings } from "lucide-react";
import { formatCurrency } from "../utils/format"; // assuming you have same utils
// props: open (bool), onClose(), onSave(item), initial (object|null), creating bool
export default function ItemForm({ open, onClose, onSave, initial = null }) {
  const isEdit = !!initial;
  const [isService, setIsService] = useState(initial?.type === "service" || false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    hsn: "",
    unit: "",
    category: "",
    item_code: "",
    sale_price: "",
    purchase_price: "",
    tax_rate: "",
    stock_qty: "",
    stock_value: "",
  });

  // init on open / initial change
  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name ?? "",
        hsn: initial.hsn ?? "",
        unit: initial.unit ?? "",
        category: initial.category ?? "",
        item_code: initial.item_code ?? "",
        sale_price: initial.sale_price ?? "",
        purchase_price: initial.purchase_price ?? "",
        tax_rate: initial.tax_rate ?? "",
        stock_qty: initial.stock_qty ?? "",
        stock_value: initial.stock_value ?? "",
      });
      setIsService((initial.type ?? "product") === "service");
    } else {
      setForm({
        name: "",
        hsn: "",
        unit: "",
        category: "",
        item_code: "",
        sale_price: "",
        purchase_price: "",
        tax_rate: "",
        stock_qty: "",
        stock_value: "",
      });
      setIsService(false);
    }
  }, [initial, open]);

  function setField(k, v) {
    setForm((s) => ({ ...s, [k]: v }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      // construct payload (adjust fields to match your backend)
      const payload = {
        name: String(form.name || "").trim(),
        type: isService ? "service" : "product",
        hsn: form.hsn || null,
        unit: form.unit || null,
        category: form.category || null,
        item_code: form.item_code || null,
        sale_price: Number(form.sale_price || 0),
        purchase_price: Number(form.purchase_price || 0),
        tax_rate: form.tax_rate || null,
        stock_qty: Number(form.stock_qty || 0),
        stock_value: Number(form.stock_value || 0),
      };

      // call onSave which the parent will implement (calls API)
      const saved = await onSave(payload);
      // parent should close modal. still we can clear if created
      // if no exception thrown assume success
    } catch (err) {
      console.error("save item failed", err);
      // optionally show error toast
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-[95%] max-w-[1100px] bg-white rounded shadow-lg overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{isEdit ? "Edit Item" : "Add Item"}</h3>
            <div className="flex items-center space-x-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="type"
                  checked={!isService}
                  onChange={() => setIsService(false)}
                />
                Product
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="type"
                  checked={isService}
                  onChange={() => setIsService(true)}
                />
                Service
              </label>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button type="button" className="p-2 hover:bg-gray-100 rounded" title="settings">
              <Settings size={16} />
            </button>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded" title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* main form */}
        <div className="p-6 space-y-6">
          {/* Top row: name, hsn, unit, image button */}
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <label className="block text-xs text-gray-600 mb-1">Item Name *</label>
              <input
                value={form.name}
                onChange={(e) => setField("name", e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Item HSN</label>
              <input value={form.hsn} onChange={(e) => setField("hsn", e.target.value)}
                className="w-full px-3 py-2 border rounded" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Unit</label>
              <button type="button" className="w-full px-3 py-2 border rounded text-sm" onClick={()=>{/*open unit picker*/}}>
                {form.unit || "Select Unit"}
              </button>
            </div>
            <div className="col-span-2 flex items-end justify-end">
              <button type="button" className="px-4 py-2 bg-blue-50 text-blue-600 rounded border">Add Image</button>
            </div>
          </div>

          {/* pricing + stock tabs */}
          <div className="border rounded">
            <div className="border-b px-4">
              <ul className="flex gap-4 -mb-px">
                <li className="text-sm py-3 border-b-2 border-blue-600">Pricing</li>
                <li className="text-sm py-3 text-gray-400">Stock</li>
              </ul>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Sale Price</label>
                    <div className="flex gap-2">
                      <input
                        value={form.sale_price}
                        onChange={(e) => setField("sale_price", e.target.value)}
                        className="flex-1 px-3 py-2 border rounded"
                        placeholder="Sale Price"
                        type="number"
                        step="0.01"
                      />
                      <select value={form.tax_rate ?? ""} onChange={(e)=>setField("tax_rate", e.target.value)} className="px-3 py-2 border rounded">
                        <option value="">Without Tax</option>
                        <option value="0">GST 0%</option>
                        <option value="5">GST 5%</option>
                        <option value="12">GST 12%</option>
                        <option value="18">GST 18%</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Purchase Price</label>
                    <input value={form.purchase_price} onChange={(e)=>setField("purchase_price", e.target.value)} type="number" step="0.01" className="w-full px-3 py-2 border rounded" placeholder="Purchase price"/>
                  </div>
                </div>

                <div className="col-span-4 space-y-4">
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-600">Stock Quantity</div>
                    <div className="text-lg font-semibold">{form.stock_qty ?? 0}</div>
                  </div>
                  <div className="bg-gray-50 rounded p-3">
                    <div className="text-xs text-gray-600">Stock Value</div>
                    <div className="text-lg font-semibold">{formatCurrency(Number(form.stock_value || 0))}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-4 border-t">
          <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-sm">Cancel</button>
          <button type="submit" className={`px-4 py-2 rounded text-white ${loading ? "bg-gray-400":"bg-blue-600"}`} disabled={loading}>
            {loading ? (isEdit ? "Saving..." : "Saving...") : isEdit ? "Save" : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
