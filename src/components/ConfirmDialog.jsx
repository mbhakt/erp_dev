// src/components/ConfirmDialog.jsx
import React from "react";

export default function ConfirmDialog({ open, title = "Confirm", message, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white rounded p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-slate-600 mt-2">{message}</p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="px-3 py-1 border rounded">Cancel</button>
          <button onClick={onConfirm} className="px-3 py-1 bg-red-600 text-white rounded">Confirm</button>
        </div>
      </div>
    </div>
  );
}
