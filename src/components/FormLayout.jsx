// src/components/FormLayout.jsx
import React from "react";

/**
 * Props:
 *  - children: left (main) content
 *  - summary: right column content (summary, totals)
 *  - full?: if true, summary hidden (mobile)
 */
export default function FormLayout({ children, summary }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 bg-white rounded shadow p-4">
        {children}
      </div>

      <aside className="bg-white rounded shadow p-4">
        {summary}
      </aside>
    </div>
  );
}
