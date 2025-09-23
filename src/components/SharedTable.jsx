import React from "react";

/**
 * Simple SharedTable
 * Props:
 *  - columns: [{ key, label }]
 *  - data: array of row objects
 *  - actions: function(row) => ReactNode
 */
export default function SharedTable({ columns = [], data = [], actions = () => null }) {
  return (
    <div className="bg-white rounded shadow-sm overflow-hidden">
      <table className="w-full table-auto text-sm">
        <thead className="text-left text-slate-600 bg-slate-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3">{c.label}</th>
            ))}
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="p-6 text-center text-slate-400">
                No records to display
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="border-t">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-3">{row[c.key]}</td>
                ))}
                <td className="px-4 py-3 text-right">
                  {actions(row)}
                </td>
             </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
