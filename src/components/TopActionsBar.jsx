// src/components/TopActionsBar.jsx
import React from "react";

export default function TopActionsBar({ onExport, onPrint, onCharts, children }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div>{children}</div>
      <div className="flex items-center gap-2">
        <button onClick={onExport} className="px-3 py-1 border rounded">Export</button>
        <button onClick={onPrint} className="px-3 py-1 border rounded">Print</button>
        <button onClick={onCharts} className="px-3 py-1 border rounded">Charts</button>
      </div>
    </div>
  );
}
