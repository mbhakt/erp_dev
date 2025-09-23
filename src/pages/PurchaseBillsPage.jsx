// src/pages/PurchaseBillsPage.jsx
import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import PurchaseModal from "../components/PurchaseModal";
 import {
  fetchPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
} from "../api";

export default function PurchaseBillsPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [localModalOpen, setLocalModalOpen] = useState(false);
  const [localEditPurchase, setLocalEditPurchase] = useState(null);

  async function fetchPurchasesList() {
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
  }

  useEffect(() => {
    fetchPurchasesList();
  }, []);

  async function handleAddPurchase() {
    setLocalEditPurchase(null);
    setLocalModalOpen(true);
  }

  async function handleEditPurchase(purchase) {
    setLocalEditPurchase(purchase);
    setLocalModalOpen(true);
  }

  async function handleDeletePurchase(id) {
    if (!window.confirm("Delete this purchase bill?")) return;
    try {
      await deletePurchase(id);
      fetchPurchasesList();
    } catch (err) {
      console.error("Delete purchase error:", err);
    }
  }

  function handleLocalSaved() {
    setLocalModalOpen(false);
    setLocalEditPurchase(null);
    fetchPurchasesList();
  }

  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Purchase Bills</h1>
          <button
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            onClick={handleAddPurchase}
            aria-label="Add Purchase"
          >
            + Add Purchase
          </button>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : purchases.length === 0 ? (
          <div className="text-gray-500">No purchase bills yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 bg-white">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Bill No</th>
                  <th className="p-2 border">Vendor</th>
                  <th className="p-2 border">Bill Date</th>
                  <th className="p-2 border text-right">Total</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{p.bill_no}</td>
                    <td className="p-2 border">{p.vendor_name}</td>
                    <td className="p-2 border">
                      {p.bill_date
                        ? new Date(p.bill_date).toLocaleDateString("en-GB")
                        : "-"}
                    </td>
                    <td className="p-2 border text-right">
                      {Number(p.total_amount || 0).toFixed(2)}
                    </td>
                    <td className="p-2 border">
                      <button
                        className="text-sm text-blue-600 hover:underline mr-2"
                        onClick={() => handleEditPurchase(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => handleDeletePurchase(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {localModalOpen && (
          <PurchaseModal
            open={true}
            purchase={localEditPurchase}
            onClose={() => {
              setLocalModalOpen(false);
              setLocalEditPurchase(null);
            }}
            onSaved={handleLocalSaved}
          />
        )}
      </div>
    </AppLayout>
  );
}
