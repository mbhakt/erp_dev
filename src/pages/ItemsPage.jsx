// src/pages/ItemsPage.jsx
import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  fetchItems,
  createItem,
  updateItem,
  deleteItem,
} from "../api";

// Currency formatter for Indian rupees with two decimals
const currencyFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// format ISO / timestamp -> DD-MM-YYYY (safe)
function formatIndianDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // item object when editing
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // form state
  const emptyForm = {
    name: "",
    sku: "",
    unit: "",
    sale_price: "",
    purchase_price: "",
    qty_in_stock: "",
    description: "",
  };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchItems error:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing(null);
    setForm(emptyForm);
    setErrorMsg("");
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({
      name: item.name ?? "",
      sku: item.sku ?? "",
      unit: item.unit ?? "",
      sale_price: item.sale_price != null ? String(item.sale_price) : "",
      purchase_price:
        item.purchase_price != null ? String(item.purchase_price) : "",
      qty_in_stock:
        item.qty_in_stock != null ? String(item.qty_in_stock) : "",
      description: item.description ?? "",
    });
    setErrorMsg("");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setErrorMsg("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e?.preventDefault();
    setErrorMsg("");

    // basic validation
    if (!form.name || !form.name.trim()) {
      setErrorMsg("Item name is required.");
      return;
    }
    const sp = Number(form.sale_price || 0);
    if (Number.isNaN(sp) || sp < 0) {
      setErrorMsg("Sale price must be a valid non-negative number.");
      return;
    }

    const payload = {
      name: String(form.name).trim(),
      sku: form.sku || null,
      unit: form.unit || null,
      sale_price: Number(form.sale_price || 0),
      purchase_price: Number(form.purchase_price || 0),
      qty_in_stock: Number(form.qty_in_stock || 0),
      description: form.description || null,
    };

    setSaving(true);
    try {
      let res;
      if (editing && editing.id) {
        res = await updateItem(editing.id, payload);
      } else {
        res = await createItem(payload);
      }
      // reload list after success
      await loadItems();
      closeModal();
    } catch (err) {
      console.error("Item save failed", err);
      setErrorMsg(
        err?.response?.data?.error ||
          err?.message ||
          "Save failed. Check server logs."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete item "${item.name}"?`)) return;
    try {
      await deleteItem(item.id);
      await loadItems();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed. See console for details.");
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Items</h1>
          <div>
            <button
              className="px-4 py-2 rounded bg-blue-600 text-white"
              onClick={openAdd}
            >
              + Add Item
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="mb-2 text-sm text-slate-600">Products</div>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="text-left bg-gray-50">
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">SKU</th>
                  <th className="px-4 py-2">Unit</th>
                  <th className="px-4 py-2 text-right">Sale Price</th>
                  <th className="px-4 py-2 text-right">Purchase Price</th>
                  <th className="px-4 py-2 text-right">Stock</th>
                  <th className="px-4 py-2">Description</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-gray-600">
                      Loading...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-4 text-center text-gray-600">
                      No items yet.
                    </td>
                  </tr>
                ) : (
                  items.map((it) => (
                    <tr key={it.id} className="border-t">
                      <td className="px-4 py-3">{it.name}</td>
                      <td className="px-4 py-3">{it.sku || "-"}</td>
                      <td className="px-4 py-3">{it.unit || "-"}</td>
                      <td className="px-4 py-3 text-right">
                        {currencyFmt.format(Number(it.sale_price ?? 0))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {currencyFmt.format(Number(it.purchase_price ?? 0))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {Number(it.qty_in_stock ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">{it.description || "-"}</td>
                      <td className="px-4 py-3">
                        {formatIndianDate(it.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          className="px-2 py-1 rounded border mr-2"
                          onClick={() => openEdit(it)}
                        >
                          Edit
                        </button>
                        <button
                          className="px-2 py-1 rounded border"
                          onClick={() => handleDelete(it)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal (Add / Edit) */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-24">
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={closeModal}
            />
            <div className="relative w-full max-w-3xl bg-white rounded shadow-lg p-6 z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">
                  {editing ? "Edit Item" : "Add Item"}
                </h3>
                <button
                  className="text-gray-500"
                  onClick={() => {
                    closeModal();
                  }}
                >
                  ✕
                </button>
              </div>

              {errorMsg && (
                <div className="mb-3 text-sm text-red-600">{errorMsg}</div>
              )}

              <form onSubmit={handleSave}>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Item Name
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      SKU / Code
                    </label>
                    <input
                      name="sku"
                      value={form.sku}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Sale Price
                    </label>
                    <input
                      name="sale_price"
                      value={form.sale_price}
                      onChange={handleChange}
                      type="number"
                      step="0.01"
                      className="w-full border p-2 rounded text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Purchase Price
                    </label>
                    <input
                      name="purchase_price"
                      value={form.purchase_price}
                      onChange={handleChange}
                      type="number"
                      step="0.01"
                      className="w-full border p-2 rounded text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Unit</label>
                    <input
                      name="unit"
                      value={form.unit}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Qty in stock
                    </label>
                    <input
                      name="qty_in_stock"
                      value={form.qty_in_stock}
                      onChange={handleChange}
                      type="number"
                      step="0.01"
                      className="w-full border p-2 rounded text-right"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <input
                      name="description"
                      value={form.description}
                      onChange={handleChange}
                      className="w-full border p-2 rounded"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div>
                    <button
                      type="button"
                      className="px-4 py-2 border rounded mr-2"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded"
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save Item"}
                    </button>
                  </div>

                  <div className="text-sm text-gray-600">
                    {editing ? "Editing" : "New item"}
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
