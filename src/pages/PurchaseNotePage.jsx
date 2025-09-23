// src/pages/PurchaseNotePage.jsx
import React, { useState } from "react";
import SharedTable from "../components/SharedTable";
import PurchaseModal from "../components/PurchaseModal";
import AppLayout from "../components/AppLayout";

export default function PurchaseNotePage() {
  const [rows, setRows] = useState([
    {
      id: "pn1",
      date: "2025-09-17",
      ref: "DN-001",
      vendor: "Sreedevi Printers",
      amount: 350,
      status: "Issued",
      paymentType: "Credit",
    },
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

  function handleSave(payload) {
    if (!payload) {
      setOpen(false);
      return;
    }
    // normalize: ensure numeric amount
    payload.amount = Number(payload.amount || 0);

    if (payload.id && rows.some((r) => r.id === payload.id)) {
      setRows(rows.map((r) => (r.id === payload.id ? payload : r)));
    } else {
      setRows([payload, ...rows]);
    }
    setOpen(false);
  }

  const columns = [
    { key: "date", label: "Date" },
    { key: "ref", label: "Ref / Debit Note No" },
    { key: "vendor", label: "Vendor" },
    { key: "amount", label: "Amount" },
    { key: "status", label: "Status" },
  ];

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Purchase Note / Debit Note</h1>
        <div>
          <button className="px-4 py-2 rounded bg-amber-500 text-white" onClick={handleAdd}>
            + Add Return / Debit Note
          </button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="mb-4 text-sm text-slate-600">
          Record purchase returns and debit notes issued to suppliers.
        </div>

        <SharedTable
          columns={columns}
          data={rows.map((r) => ({ ...r, amount: `₹ ${Number(r.amount || 0).toFixed(2)}` }))}
          actions={(row) => (
            <>
              <button className="px-2 py-1 border rounded mr-2" onClick={() => handleEdit(row)}>
                View / Edit
              </button>
              <button className="px-2 py-1 border rounded" onClick={() => setRows(rows.filter((r) => r.id !== row.id))}>
                Delete
              </button>
            </>
          )}
        />
      </div>

      {open && <PurchaseModal open={open} initial={editing} onClose={() => setOpen(false)} onSave={handleSave} />}
    </div>
    </AppLayout>
  );
}
