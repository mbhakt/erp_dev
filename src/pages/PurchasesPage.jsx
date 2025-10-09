import React, { useEffect, useState } from "react";
import { fetchPurchases, createPurchase, updatePurchase, deletePurchase, fetchParties, fetchItems } from '../api';
import PurchaseModal from "../components/PurchaseModal";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [saving, setSaving] = useState(false);
  const [parties, setParties] = useState([]);
  const [items, setItems] = useState([]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await fetchPurchases();
      setPurchases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("fetchPurchases error:", err);
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
    // load lookups for modal selects
    (async () => {
      try {
        const [ps, its] = await Promise.all([fetchParties(), fetchItems()]);
        setParties(ps || []);
        setItems(its || []);
      } catch (e) {
        console.error("lookup load failed", e);
      }
    })();
  }, []);

  const onSave = async (formData) => {
    setSaving(true);
    try {
      if (editingPurchase?.id) {
        await updatePurchase(editingPurchase.id, formData);
      } else {
        await createPurchase(formData);
      }
      await fetchList();
      setModalOpen(false);
      setEditingPurchase(null);
    } catch (err) {
      console.error("Purchase save failed", err);
      throw err; // allow modal to show/save error if needed
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Purchases</h2>
        <button className="px-3 py-1 rounded bg-indigo-600 text-white" onClick={() => { setEditingPurchase(null); setModalOpen(true); }}>
          Add Purchase
        </button>
      </div>

      <PurchaseModal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        purchase={editingPurchase}
        onSave={onSave}
        saving={saving}
        parties={parties}
        items={items}
      />

      {loading ? (
        <p>Loading…</p>
      ) : purchases.length === 0 ? (
        <div>
          <p>No purchase bills yet.</p>
          <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => setModalOpen(true)}>Add Purchase</button>
        </div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="text-left px-4 py-2">Date</th>
              <th className="text-left px-4 py-2">Party</th>
              <th className="text-right px-4 py-2">Subtotal</th>
              <th className="text-right px-4 py-2">Tax</th>
              <th className="text-right px-4 py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2">{p.date ? new Date(p.date).toLocaleDateString() : ""}</td>
                <td className="px-4 py-2">{p.party_name || (p.party && p.party.name) || ""}</td>
                <td className="px-4 py-2 text-right">{Number(p.sub_total || 0).toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{Number(p.tax_total || 0).toFixed(2)}</td>
                <td className="px-4 py-2 text-right">{Number(p.grand_total || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}