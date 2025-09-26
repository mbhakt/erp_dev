// src/pages/PartiesPage.jsx
import React, { useEffect, useState } from "react";
import AppLayout from "../components/AppLayout";
import { fetchParties, createParty, updateParty, deleteParty } from "../api";

function PartyModal({ open, party, onClose, onSave }) {
  const [form, setForm] = useState({ name: "", phone: "", email: "", address: "" });

  useEffect(() => {
    if (party) {
      setForm({
        name: party.name ?? "",
        phone: party.phone ?? party.mobile ?? "",
        email: party.email ?? "",
        address: party.address ?? "",
      });
    } else {
      setForm({ name: "", phone: "", email: "", address: "" });
    }
  }, [party, open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-[720px] rounded shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{party ? "Edit Party" : "Add Party"}</h3>
          <button className="text-lg" onClick={onClose}>✕</button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-slate-600">Name</label>
            <input className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Phone</label>
            <input className="w-full border p-2 rounded" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Email</label>
            <input className="w-full border p-2 rounded" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm text-slate-600">Address</label>
            <input className="w-full border p-2 rounded" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button className="px-3 py-1 border rounded" onClick={onClose}>Cancel</button>
          <button
            className="px-3 py-1 bg-green-600 text-white rounded"
            onClick={async () => {
              try {
                if (party && (party.id || party._id)) {
                  await updateParty(party.id ?? party._id, form);
                } else {
                  await createParty(form);
                }
                if (typeof onSave === "function") onSave();
              } catch (err) {
                console.error("Party save failed", err);
                alert("Save failed");
              }
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const data = await fetchParties();
      setParties(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      console.error(err);
      setParties([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(p) {
    if (!confirm(`Delete ${p.name}?`)) return;
    try {
      await deleteParty(p.id ?? p._id);
      load();
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Parties</h1>
          <div>
            <button className="px-3 py-2 bg-green-600 text-white rounded" onClick={() => { setEditing(null); setModalOpen(true); }}>
              Add Party
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          {loading ? <div>Loading...</div> : null}

          <div className="space-y-3">
            {parties.map((p) => (
              <div key={p.id ?? p._id} className="border rounded p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium text-lg">{p.name}</div>
                  <div className="text-sm text-slate-500 mt-1">• {p.phone ?? p.mobile ?? ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="px-2 py-1 border rounded" onClick={() => { setEditing(p); setModalOpen(true); }}>Edit</button>
                  <button className="px-2 py-1 border rounded text-red-600" onClick={() => handleDelete(p)}>Delete</button>
                </div>
              </div>
            ))}
            {parties.length === 0 && <div className="p-6 text-center text-slate-500">No parties yet.</div>}
          </div>
        </div>
      </div>

      <PartyModal
        open={modalOpen}
        party={editing}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={() => { setModalOpen(false); setEditing(null); load(); }}
      />
    </AppLayout>
  );
}
