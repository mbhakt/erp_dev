import React, { useState } from "react";
import SharedTable from "../components/SharedTable";
import AddItemModal from "../components/AddItemModal";
import AppLayout from "../components/AppLayout";

export default function ItemsPage() {
  const [items, setItems] = useState([
    { id: "it1", name: "Product A", sku: "PA-001", rate: 499, stock: 10 },
  ]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function handleAdd() {
    setEditing(null);
    setOpen(true);
  }

  function handleEdit(row) {
    setEditing(row);
    setOpen(true);
  }

  function handleSave(saved) {
    if (!saved) return setOpen(false);
    if (saved.id && items.some((r) => r.id === saved.id)) {
      setItems(items.map((r) => (r.id === saved.id ? saved : r)));
    } else {
      setItems([saved, ...items]);
    }
    setOpen(false);
  }

  const columns = [
    { key: "name", label: "Item" },
    { key: "sku", label: "SKU" },
    { key: "rate", label: "Rate" },
    { key: "stock", label: "Stock" },
  ];

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Items</h1>
        <div>
          <button className="px-4 py-2 rounded bg-amber-500 text-white" onClick={handleAdd}>
            + Add Item
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <SharedTable
          columns={columns}
          data={items}
          actions={(row) => (
            <>
              <button className="px-2 py-1 border rounded mr-2" onClick={() => handleEdit(row)}>
                Edit
              </button>
              <button className="px-2 py-1 border rounded" onClick={() => setItems(items.filter((r) => r.id !== row.id))}>
                Delete
              </button>
            </>
          )}
        />
      </div>

      {open && <AddItemModal open={open} initial={editing} onClose={() => setOpen(false)} onSaved={handleSave} />}
    </div>
    </AppLayout>
  );
}
