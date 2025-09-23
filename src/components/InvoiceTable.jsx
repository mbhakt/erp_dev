// src/components/InvoiceTable.jsx
import React from 'react';
import { formatDateIso, formatCurrency } from '../utils/format';

// Defensive invoice table: uses invoice_date || created_at, safe parsing
export default function InvoiceTable({ invoices = [] }) {
  // defensive parse helper
  const toNumber = (v) => {
    const n = typeof v === 'number' ? v : parseFloat(String(v ?? 0).replace(/,/g, ''));
    return Number.isNaN(n) ? 0 : n;
  };

  const grandTotal = invoices.reduce((acc, inv) => acc + toNumber(inv.total ?? inv.amount ?? 0), 0);
  const grandBalance = invoices.reduce((acc, inv) => {
    const total = toNumber(inv.total ?? inv.amount ?? 0);
    const received = toNumber(inv.received ?? 0);
    return acc + (total - received);
  }, 0);

  const prettyTotal = formatCurrency(grandTotal);
  const prettyBalance = formatCurrency(grandBalance);

  // Debug logging (only in development)
  if (process.env.NODE_ENV === 'development' && invoices && invoices.length > 0) {
    // eslint-disable-next-line no-console
    console.log('first invoice raw date:', invoices[0].invoice_date);
    // eslint-disable-next-line no-console
    console.log('formatDateIso output:', formatDateIso(invoices[0].invoice_date));
  }

  return (
    <div className="p-4">
      {/* Summary header - visible, with border and background */}
      <div className="mb-4 bg-white border rounded p-4 flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">Total Sales Amount</div>
          <div className="text-2xl font-bold text-gray-900">{prettyTotal}</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-gray-500">Grand Balance</div>
          <div className="text-lg font-semibold text-red-600">{prettyBalance}</div>
        </div>
      </div>{/* <-- header closed here */}

      {/* Table */}
      <div className="bg-white border rounded">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr className="text-left text-xs text-gray-600 uppercase">
              <th className="py-3 px-4">📅 Date TEST</th>
              <th className="py-3 px-4">Invoice no</th>
              <th className="py-3 px-4">Party Name</th>
              <th className="py-3 px-4">Transaction</th>
              <th className="py-3 px-4">Payment Type</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-right">Balance</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-10 text-center text-gray-500">
                  No invoices to show
                </td>
              </tr>
            ) : (
              invoices.map((inv) => {
                // use invoice_date or created_at fallback
                const rawDate = inv.invoice_date ?? inv.invoiceDate ?? inv.created_at ?? inv.createdAt;
                const dateStr = formatDateIso(rawDate);
                const totalNum = toNumber(inv.total ?? inv.amount ?? 0);
                const receivedNum = toNumber(inv.received ?? 0);
                const balanceNum = totalNum - receivedNum;

                return (
                  <tr key={inv.id} className="odd:bg-white even:bg-gray-50 hover:bg-gray-100">
                    <td className="py-3 px-4">
  {(() => {
    const raw = inv.invoice_date ?? inv.invoiceDate ?? inv.created_at ?? inv.createdAt;
    try {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) return raw || '-';
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch (e) {
      return raw || '-';
    }
  })()}
</td>
                    <td className="py-3 px-4">{inv.invoice_no ?? inv.invoiceNo ?? '-'}</td>
                    <td className="py-3 px-4">{inv.party_name ?? inv.customer_name ?? '-'}</td>
                    <td className="py-3 px-4">{inv.transaction ?? 'Sale'}</td>
                    <td className="py-3 px-4">{inv.payment_type ?? '—'}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(totalNum)}</td>
                    <td className="py-3 px-4 text-right">{formatCurrency(balanceNum)}</td>
                    <td className="py-3 px-4">
                      <button className="px-2 py-1 text-xs border rounded">Edit</button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>

          <tfoot className="bg-gray-100 border-t">
  <tr className="font-semibold text-sm">
    <td className="py-3 px-4" />                     {/* Date */}
    <td className="py-3 px-4" />                     {/* Invoice no */}
    <td className="py-3 px-4" />                     {/* Party Name */}
    <td className="py-3 px-4" />                     {/* Transaction */}
    <td className="py-3 px-4 text-right">Totals</td> {/* Payment Type label cell (right aligned) */}
    <td className="py-3 px-4 text-right">{prettyTotal}</td>   {/* Amount column */}
    <td className="py-3 px-4 text-right">{prettyBalance}</td> {/* Balance column */}
    <td className="py-3 px-4" />                     {/* Actions */}
  </tr>
</tfoot>
        </table>
      </div>

      {/* DEBUG: quick field-inspection panel (remove later) */}
      <details className="mt-3 text-xs text-gray-500">
        <summary className="cursor-pointer">Debug: sample first invoice raw data</summary>
        <pre className="p-2 bg-gray-50 rounded text-xs overflow-auto">
          {JSON.stringify(invoices[0] ?? {}, null, 2)}
        </pre>
      </details>
    </div>
  );
}
