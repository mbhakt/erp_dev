// src/components/PurchaseModal.jsx
import React, { useEffect, useState } from "react";

/**
 * Props:
 * - open (bool)
 * - onClose (fn)
 * - purchase (object | null)
 * - onSave (fn) -> called with { party_id, date, notes, lines }
 * - saving (bool)
 * - parties (array) optional: [{id, name}]
 * - items (array) optional: [{id, name, rate}]
 */
export default function PurchaseModal({
  open,
  onClose,
  purchase,
  onSave,
  saving = false,
  parties = [],
  items = [],
}) {
  const [form, setForm] = useState({
    party_id: "",
    date: "",
    notes: "",
    lines: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const initialLines = (purchase?.lines || []).map((l) => ({
        id: l.id || undefined,
        item_id: l.item_id || l.item?.id || "",
        desc: l.desc || "",
        qty: l.qty ?? 1,
        rate: l.rate ?? 0,
        taxPercent: l.taxPercent ?? 0,
      }));
      const dateVal = purchase?.date
        ? new Date(purchase.date).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];
      setForm({
        party_id: purchase?.party_id || purchase?.party?.id || "",
        date: dateVal,
        notes: purchase?.notes || "",
        lines:
          initialLines.length > 0
            ? initialLines
            : [{ item_id: "", desc: "", qty: 1, rate: 0, taxPercent: 0 }],
      });
      setErrors({});
    }
  }, [open, purchase]);

  if (!open) return null;

  // currency formatter (India/Rupee). Change locale/currency as needed.
  const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" });

  // computeTotals: returns { sub_total, tax_total, grand_total }
  const computeTotals = (linesArray) => {
    const sub_total = (linesArray || []).reduce((s, l) => {
      const q = Number(l.qty) || 0;
      const r = Number(l.rate) || 0;
      return s + q * r;
    }, 0);

    const tax_total = (linesArray || []).reduce((s, l) => {
      const q = Number(l.qty) || 0;
      const r = Number(l.rate) || 0;
      const taxPercent = Number(l.taxPercent) || 0;
      return s + (q * r * taxPercent) / 100;
    }, 0);

    const grand_total = sub_total + tax_total;
    return {
      sub_total: Number(sub_total.toFixed(2)),
      tax_total: Number(tax_total.toFixed(2)),
      grand_total: Number(grand_total.toFixed(2)),
    };
  };

  const totals = computeTotals(form.lines);

  const addLine = () => {
    setForm((f) => ({ ...f, lines: [...f.lines, { item_id: "", desc: "", qty: 1, rate: 0, taxPercent: 0 }] }));
  };

  const removeLine = (idx) => {
    setForm((f) => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));
  };

  const updateLine = (idx, patch) => {
    setForm((f) => {
      const lines = [...f.lines];
      lines[idx] = { ...lines[idx], ...patch };
      return { ...f, lines };
    });
  };

  const validate = () => {
    const e = {};
    if (!form.party_id) e.party_id = "Select party";
    if (!form.date) e.date = "Date required";
    if (!form.lines.length) e.lines = "Add at least one line";
    form.lines.forEach((l, idx) => {
      if (!l.item_id && !l.desc) e[`line_${idx}`] = "Select item or provide description";
      if (!l.qty || Number(l.qty) <= 0) e[`line_qty_${idx}`] = "Qty > 0";
    });
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const e = validate();
    setErrors(e);

    if (Object.keys(e).length) return;

    if (!onSave || typeof onSave !== "function") {
      console.error("PurchaseModal: onSave missing or not a function", onSave);
      alert("Save handler not configured. Please try again or contact support.");
      return;
    }

    const payload = {
      party_id: form.party_id,
      date: form.date,
      notes: form.notes,
      lines: form.lines.map((l) => ({
        item_id: l.item_id || null,
        desc: l.desc || "",
        qty: Number(l.qty) || 0,
        rate: Number(l.rate) || 0,
        taxPercent: Number(l.taxPercent) || 0,
      })),
    };

    setSubmitting(true);
    try {
      await onSave(payload);
      // parent should close modal and refresh list after successful save
    } catch (err) {
      console.error("Purchase save failed:", err);
      const msg = err?.response?.data?.message || err?.message || "Save failed — please try again.";
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/40 p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-3xl bg-white rounded shadow-lg p-5 mb-10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{purchase ? "Edit Purchase" : "Add Purchase"}</h3>
          <button type="button" onClick={() => !submitting && !saving && onClose()} className="text-gray-500">✕</button>
        </div>

        {/* Totals preview under title */}
        <div className="mb-4 flex gap-6 items-center">
          <div className="text-sm">
            <div>Subtotal: <strong>{fmt.format(totals.sub_total)}</strong></div>
            <div>Tax: <strong>{fmt.format(totals.tax_total)}</strong></div>
            <div className="text-lg">Total: <strong>{fmt.format(totals.grand_total)}</strong></div>
          </div>

          <div className="ml-auto text-sm text-gray-500">
            {/* small hint */}
            <div>Totals are calculated from the current line items.</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3">
          <div>
            <label className="block text-sm font-medium">Party</label>
            {parties.length > 0 ? (
              <select value={form.party_id} onChange={(e) => setForm((f) => ({ ...f, party_id: e.target.value }))} className="w-full border px-3 py-2 rounded">
                <option value="">-- Select party --</option>
                {parties.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            ) : (
              <input value={form.party_id} onChange={(e) => setForm((f) => ({ ...f, party_id: e.target.value }))} className="w-full border px-3 py-2 rounded" placeholder="Party ID or name" />
            )}
            {errors.party_id && <div className="text-red-600 text-sm mt-1">{errors.party_id}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Date</label>
            <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} className="w-full border px-3 py-2 rounded" />
            {errors.date && <div className="text-red-600 text-sm mt-1">{errors.date}</div>}
          </div>

          <div>
            <label className="block text-sm font-medium">Notes</label>
            <input value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} className="w-full border px-3 py-2 rounded" placeholder="Optional notes" />
          </div>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-medium">Line Items</h4>
            <button type="button" onClick={addLine} className="text-sm px-2 py-1 bg-indigo-600 text-white rounded">Add Line</button>
          </div>

          <div className="space-y-2">
            {form.lines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-6 gap-2 items-end border-b pb-2">
                <div className="col-span-2">
                  <label className="block text-xs">Item</label>
                  {items.length > 0 ? (
                    <select value={line.item_id} onChange={(e) => updateLine(idx, { item_id: e.target.value, rate: (items.find(it => String(it.id) === String(e.target.value)) || {}).rate || line.rate })} className="w-full border px-2 py-1 rounded">
                      <option value="">-- Select item --</option>
                      {items.map((it) => <option key={it.id} value={it.id}>{it.name}</option>)}
                    </select>
                  ) : (
                    <input value={line.item_id} onChange={(e) => updateLine(idx, { item_id: e.target.value })} className="w-full border px-2 py-1 rounded" placeholder="Item id or name" />
                  )}
                  <input value={line.desc} onChange={(e) => updateLine(idx, { desc: e.target.value })} className="w-full border px-2 py-1 rounded mt-1" placeholder="Description (optional)" />
                  {errors[`line_${idx}`] && <div className="text-red-600 text-xs">{errors[`line_${idx}`]}</div>}
                </div>

                <div>
                  <label className="block text-xs">Qty</label>
                  <input type="number" min="0" step="1" value={line.qty} onChange={(e) => updateLine(idx, { qty: e.target.value })} className="w-full border px-2 py-1 rounded" />
                  {errors[`line_qty_${idx}`] && <div className="text-red-600 text-xs">{errors[`line_qty_${idx}`]}</div>}
                </div>

                <div>
                  <label className="block text-xs">Rate</label>
                  <input value={line.rate} onChange={(e) => updateLine(idx, { rate: e.target.value })} className="w-full border px-2 py-1 rounded" inputMode="decimal" />
                </div>

                <div>
                  <label className="block text-xs">Tax %</label>
                  <input value={line.taxPercent} onChange={(e) => updateLine(idx, { taxPercent: e.target.value })} className="w-full border px-2 py-1 rounded" />
                </div>

                <div className="text-right">
                  <div className="text-sm font-medium">{fmt.format(Number(line.qty || 0) * Number(line.rate || 0))}</div>
                  <div className="mt-1 flex gap-1 justify-end">
                    <button type="button" onClick={() => removeLine(idx)} className="text-sm px-2 py-1 rounded border">Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {errors.lines && <div className="text-red-600 text-sm mt-1">{errors.lines}</div>}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={() => !submitting && !saving && onClose()} className="px-4 py-2 rounded border" disabled={submitting || saving}>Cancel</button>
          <button type="submit" className={`px-4 py-2 rounded text-white ${submitting || saving ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`} disabled={submitting || saving}>
            {submitting || saving ? "Saving..." : "Save Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}
