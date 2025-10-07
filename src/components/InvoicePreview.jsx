import React from "react";

export default function InvoicePreview({ invoice }) {
  const items = invoice?.items || [];
  const total = items.reduce((s, it) => s + (it.qty * it.price), 0);
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <h4 className="text-lg font-semibold">Invoice Preview</h4>
      <div className="mt-2 text-sm text-gray-600">Bill To: {invoice?.customer_name || "—"}</div>
      <table className="w-full mt-3 text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500">
            <th>#</th><th>Item</th><th className="text-right">Qty</th><th className="text-right">Price</th><th className="text-right">Amt</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={i} className="border-t">
              <td className="py-2">{i+1}</td>
              <td>{it.name}</td>
              <td className="text-right">{it.qty}</td>
              <td className="text-right">{formatCurrencyINR(it.price)}</td>
              <td className="text-right">{formatCurrencyINR((it.qty * it.price).toFixed(2))}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t font-medium">
            <td colSpan={4} className="pt-2 text-right">Total</td>
            <td className="pt-2 text-right">{formatCurrencyINR(total.toFixed(2))}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
