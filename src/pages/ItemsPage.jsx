// src/pages/ItemsPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  fetchItems,
  fetchItem,
  createItem,
  updateItem,
  deleteItem,
  fetchInvoices,
} from "../api";

// formatting helpers
const currencyFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function fmtDate(iso) {
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

  // left list UI
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // right panel states
  const [mode, setMode] = useState("view"); // 'view' | 'edit' | 'new'
  const [form, setForm] = useState(getEmptyForm());
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // transactions/summary states
  const [txLoading, setTxLoading] = useState(false);
  const [txSummary, setTxSummary] = useState({
    transactions: 0,
    soldQty: 0,
    soldValue: 0,
  });
  const [txError, setTxError] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  // load items from API and normalize a little
  async function loadItems() {
    setLoading(true);
    try {
      const res = await fetchItems();
      const arrRaw = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.items)
        ? res.items
        : [];

      // defensive normalize: ensure key names exist and types are sane
      const arr = (arrRaw || []).map((it) => ({
        id: it.id ?? it._id ?? null,
        sku: it.sku ?? null,
        name: it.name ?? "",
        description: it.description ?? null,
        unit: it.unit ?? "" /* may be "pcs" or empty string */,
        sale_price: it.sale_price ?? 0,
        purchase_price: it.purchase_price ?? 0,
        qty_in_stock: it.qty_in_stock ?? it.stock ?? 0,
        created_at: it.created_at ?? null,
        updated_at: it.updated_at ?? null,
        // keep full original if needed
        __raw: it,
      }));

      setItems(arr);

      // pick first item if none selected — always store as string to avoid mismatched comparisons
      if (arr.length && !selectedId) {
        const firstId = arr[0].id ?? null;
        if (firstId !== null && firstId !== undefined) {
          setSelectedId(String(firstId));
        }
      }
    } catch (err) {
      console.error("fetchItems failed:", err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  // returns currently selected item object (normalize id string comparison)
  const selectedItem = useMemo(
    () => items.find((i) => String(i.id ?? i._id) === String(selectedId)) || null,
    [items, selectedId]
  );

  // debug: show selectedItem in console (remove after verification)
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[ItemsPage] selectedItem:", selectedItem);
  }, [selectedItem]);

  // filtered left list
  const filtered = useMemo(() => {
    const q = (query || "").toLowerCase().trim();
    if (!q) return items;
    return items.filter((it) => {
      const name = String(it?.name ?? "").toLowerCase();
      const sku = String(it?.sku ?? "").toLowerCase();
      const desc = String(it?.description ?? "").toLowerCase();
      return name.includes(q) || sku.includes(q) || desc.includes(q);
    });
  }, [items, query]);

  // UI actions
  function startAdd() {
    setMode("new");
    setForm(getEmptyForm());
    setErrorMsg("");
    setTxSummary({ transactions: 0, soldQty: 0, soldValue: 0 });
  }

  function startEdit() {
    if (!selectedItem) return;
    setMode("edit");
    setForm({
      name: selectedItem.name ?? "",
      sku: selectedItem.sku ?? "",
      unit: selectedItem.unit ?? "",
      sale_price:
        selectedItem.sale_price != null ? String(selectedItem.sale_price) : "",
      purchase_price:
        selectedItem.purchase_price != null ? String(selectedItem.purchase_price) : "",
      qty_in_stock:
        selectedItem.qty_in_stock != null ? String(selectedItem.qty_in_stock) : "",
      description: selectedItem.description ?? "",
    });
    setErrorMsg("");
  }

  function cancelEdit() {
    setMode("view");
    setForm(getEmptyForm());
    setErrorMsg("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e?.preventDefault();
    setErrorMsg("");

    // simple validation
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
      if (mode === "new") {
        await createItem(payload);
      } else if (mode === "edit" && selectedItem) {
        await updateItem(selectedItem.id ?? selectedItem._id, payload);
      }
      // reload and keep first item selection stable
      await loadItems();
      setMode("view");
      setForm(getEmptyForm());
      setErrorMsg("");
    } catch (err) {
      console.error("Save failed:", err);
      const msg = err?.response?.data?.error || err?.message || "Save failed";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(it) {
    if (!window.confirm(`Delete "${it.name}"?`)) return;
    try {
      await deleteItem(it.id ?? it._id);
      await loadItems();
      if (String(selectedId) === String(it.id ?? it._id)) {
        setSelectedId(null);
        setMode("view");
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. See console.");
    }
  }

  async function pickItem(it) {
  const id = it.id ?? it._id;
  if (id == null) {
    setSelectedId(null);
    setMode("view");
    setForm(getEmptyForm());
    return;
  }

  // set selected id (string for stability)
  setSelectedId(String(id));
  setMode("view");
  setForm(getEmptyForm());
  setErrorMsg("");
  setTxSummary({ transactions: 0, soldQty: 0, soldValue: 0 });
  setTxError("");

  // fetch detailed item (guarantees unit, qty_in_stock are present)
  try {
    const detail = await fetchItem(id);
    // ensure normalized shape (same keys ItemsPage expects)
    const normalized = {
      id: detail.id ?? detail._id ?? id,
      sku: detail.sku ?? null,
      name: detail.name ?? "",
      description: detail.description ?? null,
      unit: detail.unit ?? "",
      sale_price: detail.sale_price ?? 0,
      purchase_price: detail.purchase_price ?? 0,
      qty_in_stock: detail.qty_in_stock ?? detail.stock ?? 0,
      created_at: detail.created_at ?? null,
      updated_at: detail.updated_at ?? null,
      __raw: detail,
    };

    // update items array entry for UI consistency
    setItems((prev) =>
      prev.map((x) => {
        const xid = x.id ?? x._id;
        return String(xid) === String(id) ? normalized : x;
      })
    );

    // optionally set selectedItem by ensuring selectedId already set to String(id)
    // the memo `selectedItem` uses items array, so updating items will update selectedItem
  } catch (err) {
    console.error("Failed to load item details:", err);
    // If single-item endpoint is not present, we fall back to using list item (already selected)
  }
}

  // Compute transactions summary by fetching invoices and scanning lines for selected item
  async function scanTransactions() {
    if (!selectedItem) return;
    setTxLoading(true);
    setTxError("");
    setTxSummary({ transactions: 0, soldQty: 0, soldValue: 0 });
    try {
      const res = await fetchInvoices({ limit: 1000 }); // try to fetch many; adjust as needed
      const arr = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.invoices)
        ? res.invoices
        : [];
      const idStr = String(selectedItem.id ?? selectedItem._id);
      let transactions = 0;
      let soldQty = 0;
      let soldValue = 0;
      for (const inv of arr) {
        const lines = inv.items ?? inv.invoice_items ?? inv.lines ?? inv.items_list ?? [];
        if (!Array.isArray(lines) || !lines.length) continue;
        let touched = false;
        for (const l of lines) {
          const lid = String(l.item_id ?? l.product_id ?? l.id ?? l.itemId ?? "");
          if (lid === idStr) {
            touched = true;
            const qty = Number(l.qty ?? l.quantity ?? 0) || 0;
            const rate = Number(l.unit_price ?? l.price ?? l.rate ?? 0) || 0;
            soldQty += qty;
            soldValue += qty * rate;
          }
        }
        if (touched) transactions++;
      }
      setTxSummary({ transactions, soldQty, soldValue });
    } catch (err) {
      console.error("scanTransactions failed:", err);
      setTxError("Failed to scan transactions. See console.");
    } finally {
      setTxLoading(false);
    }
  }

  // computed stock value for selected item
  const stockValues = useMemo(() => {
    if (!selectedItem) return { saleStockValue: 0, purchaseStockValue: 0 };
    const qty = Number(selectedItem.qty_in_stock ?? 0) || 0;
    const sp = Number(selectedItem.sale_price ?? 0) || 0;
    const pp = Number(selectedItem.purchase_price ?? 0) || 0;
    return {
      saleStockValue: qty * sp,
      purchaseStockValue: qty * pp,
    };
  }, [selectedItem]);

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Items</h1>
          <div>
            <button className="px-4 py-2 rounded bg-blue-600 text-white" onClick={startAdd}>
              + Add Item
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow flex overflow-hidden" style={{ minHeight: 420 }}>
          {/* Left panel: list */}
          <div style={{ width: 340 }} className="border-r">
            <div className="p-4 border-b">
              <input
                placeholder="Search items..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="overflow-auto" style={{ maxHeight: 640 }}>
              {loading ? (
                <div className="p-4 text-center text-gray-600">Loading...</div>
              ) : filtered.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No items</div>
              ) : (
                filtered.map((it) => {
                  const id = it.id ?? it._id;
                  const isSel = String(id) === String(selectedId);
                  return (
                    <div
                      key={id}
                      className={
                        "cursor-pointer px-4 py-3 border-b " + (isSel ? "bg-blue-50" : "hover:bg-gray-50")
                      }
                      onClick={() => pickItem(it)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{it.name}</div>
                        <div className="text-xs text-gray-500">{it.sku || ""}</div>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                        <div>{it.unit || "-"}</div>
                        <div className="text-right" style={{ minWidth: 110 }}>
                          <div>{currencyFmt.format(Number(it.sale_price ?? 0))}</div>
                          <div className="text-[11px]">Stock: {Number(it.qty_in_stock ?? 0).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right panel: details / edit form */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                {mode === "view" && selectedItem && <h2 className="text-xl font-semibold">{selectedItem.name}</h2>}
                {mode === "new" && <h2 className="text-xl font-semibold">Add Item</h2>}
                {mode === "edit" && <h2 className="text-xl font-semibold">Edit Item</h2>}
              </div>

              {/* Summary panel */}
              <div className="bg-gray-50 border rounded p-3 text-sm" style={{ minWidth: 260 }}>
                <div className="font-medium mb-1">Summary</div>

                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div>Stock value (sale)</div>
                  <div className="font-medium">
                    {currencyFmt.format(Number(stockValues.saleStockValue || 0))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <div>Stock value (purchase)</div>
                  <div className="font-medium">
                    {currencyFmt.format(Number(stockValues.purchaseStockValue || 0))}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mt-3">
                  <div>Transactions</div>
                  <div className="font-medium">{txSummary.transactions}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <div>Qty sold</div>
                  <div className="font-medium">{Number(txSummary.soldQty || 0).toFixed(2)}</div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <div>Sold value</div>
                  <div className="font-medium">{currencyFmt.format(Number(txSummary.soldValue || 0))}</div>
                </div>

                <div className="mt-3">
                  <button
                    className="px-3 py-1 border rounded text-sm"
                    onClick={scanTransactions}
                    disabled={!selectedItem || txLoading}
                  >
                    {txLoading ? "Scanning..." : "Scan transactions"}
                  </button>
                  {txError && <div className="text-xs text-red-600 mt-2">{txError}</div>}
                </div>
              </div>
            </div>

            <div className="mt-6">
              {mode === "view" && selectedItem && (
                <div>
                  <div className="text-sm text-gray-600">{selectedItem.sku || ""}</div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-xs text-gray-500">Unit</div>
                      <div className="font-medium">{selectedItem.unit || "-"}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Stock</div>
                      <div className="font-medium">{Number(selectedItem.qty_in_stock ?? 0).toFixed(2)}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Sale Price</div>
                      <div className="font-medium">{currencyFmt.format(Number(selectedItem.sale_price ?? 0))}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Purchase Price</div>
                      <div className="font-medium">{currencyFmt.format(Number(selectedItem.purchase_price ?? 0))}</div>
                    </div>

                    <div className="col-span-2">
                      <div className="text-xs text-gray-500">Description</div>
                      <div className="font-medium">{selectedItem.description || "-"}</div>
                    </div>

                    <div>
                      <div className="text-xs text-gray-500">Created</div>
                      <div className="font-medium">{fmtDate(selectedItem.created_at)}</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button className="px-3 py-1 border rounded mr-2" onClick={startEdit}>Edit</button>
                    <button className="px-3 py-1 border rounded" onClick={() => handleDelete(selectedItem)}>Delete</button>
                  </div>
                </div>
              )}

              {(mode === "new" || mode === "edit") && (
                <form onSubmit={handleSave}>
                  {errorMsg && <div className="mb-3 text-sm text-red-600">{errorMsg}</div>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Item Name</label>
                      <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">SKU / Code</label>
                      <input name="sku" value={form.sku} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Sale Price</label>
                      <input name="sale_price" value={form.sale_price} onChange={handleChange} type="number" step="0.01" className="w-full border p-2 rounded text-right" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Purchase Price</label>
                      <input name="purchase_price" value={form.purchase_price} onChange={handleChange} type="number" step="0.01" className="w-full border p-2 rounded text-right" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Unit</label>
                      <input name="unit" value={form.unit} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Qty in stock</label>
                      <input name="qty_in_stock" value={form.qty_in_stock} onChange={handleChange} type="number" step="0.01" className="w-full border p-2 rounded text-right" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea name="description" value={form.description} onChange={handleChange} rows={3} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <button type="button" className="px-4 py-2 border rounded mr-2" onClick={cancelEdit}>Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">{mode === "new" ? "New item" : "Editing item"}</div>
                  </div>
                </form>
              )}

              {mode === "view" && !selectedItem && !loading && (
                <div className="text-gray-600">Select an item from the left to view details, or click "Add Item".</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function getEmptyForm() {
  return {
    name: "",
    sku: "",
    unit: "",
    sale_price: "",
    purchase_price: "",
    qty_in_stock: "",
    description: "",
  };
}
