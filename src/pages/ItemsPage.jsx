import React, { useEffect, useState } from "react";
import { fetchItems, createItem, updateItem } from "../api";
import ItemModal from "../components/ItemModal";
import AppLayout from "../components/AppLayout";

export default function ItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await fetchItems();
      setItems(data);
    } catch (err) {
      console.error("fetchItems error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  const onSave = async (formData) => {
    setSaving(true);
    try {
      if (editingItem?.id) {
        await updateItem(editingItem.id, formData);
      } else {
        await createItem(formData);
      }
      await fetchList();
      setModalOpen(false);
      setEditingItem(null);
    } catch (e) {
      console.error("Item save failed", e);
      alert("Save failed: " + (e?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Items</h2>
        <button
          className="px-3 py-1 rounded bg-blue-600 text-white"
          onClick={() => { setEditingItem(null); setModalOpen(true); }}
        >
          Add Item
        </button>
      </div>

      <ItemModal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        item={editingItem}
        onSave={onSave}
        saving={saving}
      />

      {loading ? (
        <p>Loading…</p>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Rate</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{it.name}</td>
                <td className="px-4 py-2">{Number.isFinite(Number(it.rate)) ? Number(it.rate).toFixed(2) : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    </AppLayout>
  );
}
