// src/pages/PartiesPage.jsx
import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout"; // adjust path if needed
import AddPartyModal from "../components/AddPartyModal"; // adjust path if needed
import { fetchParties, deleteParty } from "../api"; // uses src/api/index.js

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    loadParties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadParties() {
    setLoading(true);
    setError("");
    try {
      const data = await fetchParties();
      // Normalize possible shapes coming from backend
      const normalized = (data || []).map((r) => ({
        id: r.id,
        name: r.name || r.party_name || r.vendor_name || "",
        phone: r.phone || "",
        balance: typeof r.balance !== "undefined" ? r.balance : (r.opening_balance || 0),
        email: r.email || "",
        raw: r,
      }));
      setParties(normalized);
    } catch (err) {
      console.error("loadParties error:", err);
      setError(err.message || "Failed to load parties");
      setParties([]);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setAddOpen(true);
  }
  function closeAdd() {
    setAddOpen(false);
  }
  function onPartySaved(created) {
    setAddOpen(false);
    // refresh list
    loadParties();
  }

  async function onDelete(id) {
    if (!confirm("Delete this party? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      await deleteParty(id);
      // remove from local list for snappy UX
      setParties(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error("deleteParty failed:", err);
      alert("Delete failed: " + (err.message || "unknown"));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppLayout>
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Parties</h1>
          <button
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
            onClick={openAdd}
          >
            + Add Party
          </button>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : error ? (
          <div className="text-red-600">Error: {error}</div>
        ) : parties.length === 0 ? (
          <div className="text-gray-500">No parties found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 bg-white">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="p-2 border">Party Name</th>
                  <th className="p-2 border">Phone</th>
                  <th className="p-2 border">Balance</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {parties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="p-2 border">{p.name || "-"}</td>
                    <td className="p-2 border">{p.phone || "-"}</td>
                    <td className="p-2 border">{Number(p.balance || 0).toFixed(2)}</td>
                    <td className="p-2 border">
                      <button
                        className="text-sm text-blue-600 hover:underline mr-3"
                        onClick={() => {
                          /* Place edit handler here if you have one */
                          alert("Edit not implemented in this snippet.");
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="text-sm text-red-600 hover:underline"
                        onClick={() => onDelete(p.id)}
                        disabled={deletingId === p.id}
                      >
                        {deletingId === p.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Add Party Modal */}
        {addOpen && (
          <AddPartyModal
            open={addOpen}
            onClose={closeAdd}
            onSaved={onPartySaved}
          />
        )}
      </div>
    </AppLayout>
  );
}
