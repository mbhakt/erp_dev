// src/components/FilterBar.jsx
import React from "react";

export default function FilterBar({
  preset,
  onPreset,
  from,
  to,
  onFrom,
  onTo,
  firm,
  firms = [],
  onFirm,
  children
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <select value={preset} onChange={(e) => onPreset?.(e.target.value)} className="rounded border px-2 py-1">
          <option value="this_month">This Month</option>
          <option value="last_month">Last Month</option>
          <option value="custom">Custom</option>
        </select>

        <input type="date" value={from} onChange={(e) => onFrom?.(e.target.value)} className="rounded border px-2 py-1" />
        <input type="date" value={to} onChange={(e) => onTo?.(e.target.value)} className="rounded border px-2 py-1" />

        <select value={firm} onChange={(e) => onFirm?.(e.target.value)} className="rounded border px-2 py-1">
          <option value="">All Firms</option>
          {firms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
        </select>
      </div>

      <div className="ml-auto flex items-center gap-2">
        {children}
      </div>
    </div>
  );
}