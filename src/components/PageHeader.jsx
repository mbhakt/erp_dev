// src/components/PageHeader.jsx
import React from "react";

/**
 * Props:
 *  - title: string
 *  - subtitle?: string
 *  - children?: right-hand actions (buttons)
 */
export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        {subtitle && <div className="text-sm text-slate-500 mt-1">{subtitle}</div>}
      </div>

      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}
