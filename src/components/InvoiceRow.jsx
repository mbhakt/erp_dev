// src/components/InvoiceRow.jsx
import React from "react";

export default function InvoiceRow({ invoice, onPreview, onDelete }) {
  return (
    <tr className="bg-white even:bg-gray-50">
      <td className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
        {invoice.id}
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        <div className="font-medium text-gray-900">{invoice.customer_name || "—"}</div>
        <div className="text-xs text-gray-500">{invoice.invoice_no}</div>
      </td>

      <td className="px-4 py-3 text-sm text-gray-700">
        {new Date(invoice.invoice_date).toLocaleDateString()}
      </td>

      <td className="px-4 py-3 text-sm text-right text-gray-800">
        ₹{Number(invoice.total || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </td>

      <td className="px-4 py-3 text-sm text-right">
        <div className="inline-flex gap-2">
          <button
            className="px-3 py-1 text-sm bg-white border rounded-md hover:bg-gray-50"
            onClick={() => onPreview(invoice)}
            aria-label={`Preview invoice ${invoice.invoice_no}`}
          >
            Preview
          </button>

          <button
            className="px-3 py-1 text-sm bg-red-50 text-red-700 border border-red-100 rounded-md hover:bg-red-100"
            onClick={() => onDelete(invoice.id)}
            aria-label={`Delete invoice ${invoice.invoice_no}`}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
