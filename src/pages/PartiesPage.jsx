// src/pages/PartiesPage.jsx
import React, { useEffect, useState } from "react";
import { fetchParties, deleteParty } from "../api";
import AddPartyModal from "../components/AddPartyModal";
import AppLayout from "../components/AppLayout";

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const rows = await fetchParties();
      setParties(rows);
    } catch (err) {
      console.error("fetchParties failed", err);
      alert("Failed to load parties");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(p) {
    setEditing(p);
    setModalOpen(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this party?")) return;
    try {
      await deleteParty(id);
      setParties(prev => prev.filter(x => x.id !== id));
    } catch (err) {
  console.error('deleteParty failed:', err);
  const msg = err?.response?.data?.error || err?.message || 'Delete failed';
  alert(`Delete failed: ${msg}`);
  }
  }
  
  function onSaved(saved) {
    setModalOpen(false);
    // If saved contains id, either update or add:
    setParties(prev => {
      if (!saved) return prev;
      const found = prev.find(r => r.id === saved.id);
      if (found) {
        return prev.map(r => r.id === saved.id ? saved : r);
      } else {
        return [saved, ...prev];
      }
    });
  }

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">Parties</h1>
        <button onClick={openAdd} className="px-3 py-1 bg-yellow-400 rounded">+ Add Party</button>
      </div>

      <div className="bg-white rounded shadow p-4">
        {loading ? <div>Loading...</div> : (
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-sm text-slate-600">
                <th>Name</th><th>Phone</th><th>Balance</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {parties.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="py-2">{p.name}</td>
                  <td>{p.phone || "-"}</td>
                  <td>{p.balance != null ? Number(p.balance).toFixed(2) : "0.00"}</td>
                  <td>
                    <button className="text-blue-600 mr-3" onClick={() => openEdit(p)}>Edit</button>
                    <button className="text-red-600" onClick={() => handleDelete(p.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AddPartyModal open={modalOpen} initial={editing} onClose={() => setModalOpen(false)} onSaved={onSaved} />
    </div>
    </AppLayout>
  );
}
