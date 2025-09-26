import React, { useEffect, useState } from "react";
import { fetchParties, createParty, updateParty } from "../api";
import PartyModal from "../components/PartyModal";
import AppLayout from "../components/AppLayout";

export default function PartiesPage() {
  const [parties, setParties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingParty, setEditingParty] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchList = async () => {
    setLoading(true);
    try {
      const data = await fetchParties();
      setParties(data);
    } catch (err) {
      console.error("fetchParties error", err);
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
      if (editingParty?.id) {
        await updateParty(editingParty.id, formData);
      } else {
        await createParty(formData);
      }
      await fetchList();
      setModalOpen(false);
      setEditingParty(null);
    } catch (e) {
      console.error("Party save failed", e);
      alert("Save failed: " + (e?.message || "Unknown error"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Parties</h2>
        <button
          className="px-3 py-1 rounded bg-green-600 text-white"
          onClick={() => { setEditingParty(null); setModalOpen(true); }}
        >
          Add Party
        </button>
      </div>

      <PartyModal
        open={modalOpen}
        onClose={() => !saving && setModalOpen(false)}
        party={editingParty}
        onSave={onSave}
        saving={saving}
      />

      {loading ? (
        <p>Loading…</p>
      ) : (
        <ul className="space-y-2">
          {parties.map((p) => (
            <li key={p.id} className="p-2 border rounded">
              <div className="font-medium">{p.name}</div>
              <div className="text-sm text-gray-600">{p.city || ""} {p.phone ? `• ${p.phone}` : ""}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
    </AppLayout>
  );
}
