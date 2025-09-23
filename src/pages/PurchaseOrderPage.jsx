import React, { useState } from "react";
import SharedTable from "../components/SharedTable";
import PurchaseModal from "../components/PurchaseModal";
import AppLayout from "../components/AppLayout";

const cols = [
  { key: "date", label: "Date" },
  { key: "ref", label: "PO No" },
 { key: "vendor", label: "Vendor" },
  { key: "status", label: "Status" },
  { key: "amount", label: "Amount" },
];

const demo = [
 { id: "po1", date: "2025-08-30", ref: "PO-101", vendor: "Vendor X", status: "Open", amount: 2000, paymentType: "Credit" },
];

export default function PurchaseOrderPage() {
  const [data, setData] = useState(demo);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

 function openAdd() {
    setEditing(null);
    setOpen(true);
  }
  function openEdit(row) {
    setEditing(row);
    setOpen(true);
  }
  function handleSave(item) {
    setData((d) => {
      const exists = d.find((x) => x.id === item.id);
      if (exists) return d.map((r) => (r.id === item.id ? item : r));
      return [item, ...d];
    });
    setOpen(false);
 }

  return (
    <AppLayout>
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Purchase Order</h1>
        <button onClick={openAdd} className="px-3 py-2 rounded bg-amber-500 text-slate-900">+ Add PO</button>
      </div>

      <SharedTable columns={cols} data={data.map(r => ({ ...r, amount: `₹ ${Number(r.amount).toFixed(2)}` }))} actions={(r) => <button className="px-2 py-1 rounded border" onClick={() => openEdit(r)}>View</button>} />

      <PurchaseModal open={open} initial={editing} onClose={() => setOpen(false)} onSave={handleSave} />
    </div>
    </AppLayout>
  );
}
