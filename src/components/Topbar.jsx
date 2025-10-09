import React from "react";
import Button from "./ui/Button";

export default function Topbar({ onOpenInvoice }) {
  return (
    <header className="flex items-center justify-between bg-white px-6 py-3 border-b border-border">
      <div className="flex items-center gap-4">
        <button className="px-2 py-1 rounded bg-gray-100">☰</button>
        <div className="relative w-96">
          <input placeholder="Search Transactions" className="w-full border border-border rounded-md px-3 py-2" />
          <span className="absolute right-3 top-2 text-sm text-muted">Ctrl+F</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button variant="primary" onClick={() => onOpenInvoice && onOpenInvoice("sale")}>+ Add Sale</Button>
        <Button variant="secondary" onClick={() => onOpenInvoice && onOpenInvoice("purchase")}>+ Add Purchase</Button>
      </div>
    </header>
  );
}