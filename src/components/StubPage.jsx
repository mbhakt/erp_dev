// src/components/StubPage.jsx
import React from "react";

export default function StubPage({ title, description }) {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <div className="text-sm text-slate-500">{new Date().toLocaleDateString()}</div>
      </div>

      <div className="bg-white rounded shadow p-6">
        <p className="text-slate-600">{description || "Work in progress — this is a placeholder page."}</p>

        <div className="mt-6 text-sm text-slate-500">
          Use this file as a starting point. Replace the placeholder with the actual page implementation when ready.
        </div>
      </div>
    </div>
  );
}