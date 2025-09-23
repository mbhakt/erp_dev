import React, { useState } from "react";
import SharedTable from "../components/SharedTable";
import PurchaseModal from "../components/PurchaseModal";

const cols = [
  { key: "date", label: "Date" },
  { key: "ref", label: "Reference" },
  { key: "vendor", label: "Party" },
  { key: "paymentType", label: "Payment Type" },
  { key: "amount", label: "Amount" },
];

const demo = [
  { id: "o1", date: "2025-09-12", ref: "PO-001", vendor: "Vendor A", paymentType: "Bank", amount: 500 },
];

export default function PaymentOutPage() {
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
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Payment Out</h1>
        <button onClick={openAdd} className="px-3 py-2 rounded bg-amber-500 text-slate-900">+ New Payment</button>
      </div>

      <div className="mb-4 text-sm text-slate-600">Track supplier payments made from bank/cash.</div>

      <SharedTable columns={cols} data={data.map(r => ({ ...r, amount: `₹ ${Number(r.amount).toFixed(2)}` }))} actions={(r) => <button className="px-2 py-1 rounded border" onClick={() => openEdit(r)}>Open</button>} />

      <PurchaseModal open={open} initial={editing} onClose={() => setOpen(false)} onSave={handleSave} />
    </div>
  );
}
