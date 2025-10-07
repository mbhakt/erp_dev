// src/pages/PartiesPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import {
  fetchParties,
  createParty,
  updateParty,
  deleteParty,
  fetchInvoices,
} from "../api";
import InvoiceForm from "../components/InvoiceForm"; // <-- existing invoice form component

// helpers
const currencyFmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
function fmtDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}
function csvDownload(filename, text) {
  const blob = new Blob([text], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function emptyForm() {
  return {
    name: "",
    phone: "",
    email: "",
    billing_address: "",
    notes: "",
  };
}

export default function PartiesPage() {
  // parties state
  const [parties, setParties] = useState([]);
  const [loadingParties, setLoadingParties] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  // form state
  const [mode, setMode] = useState("view"); // view | new | edit
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // transactions (invoices) state
  const [invoices, setInvoices] = useState([]);
  const [invLoading, setInvLoading] = useState(false);
  const [invPage, setInvPage] = useState(1);
  const [invPageSize, setInvPageSize] = useState(10);
  const [invTotalRows, setInvTotalRows] = useState(null);

  // Invoice modal (VIEW)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [viewInvoiceId, setViewInvoiceId] = useState(null);

  // small summary (derived)
  const selectedParty = useMemo(
    () => parties.find((p) => String(p.id ?? p._id) === String(selectedId)) || null,
    [parties, selectedId]
  );

  useEffect(() => {
    loadParties();
  }, []);

  useEffect(() => {
    setInvPage(1);
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, invPageSize]);

  useEffect(() => {
    setInvPage(1);
    loadInvoices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadParties() {
    setLoadingParties(true);
    try {
      const res = await fetchParties();
      const arr = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.parties)
        ? res.parties
        : [];
      setParties(arr);
      if (arr.length && !selectedId) setSelectedId(arr[0].id ?? arr[0]._id ?? null);
    } catch (err) {
      console.error("fetchParties failed:", err);
      setParties([]);
    } finally {
      setLoadingParties(false);
    }
  }

  async function loadInvoices(page = invPage) {
    if (!selectedId) {
      setInvoices([]);
      setInvTotalRows(null);
      return;
    }
    setInvLoading(true);
    try {
      const offset = (page - 1) * invPageSize;
      const params = {
        party_id: selectedId,
        limit: invPageSize,
        offset,
      };
      const res = await fetchInvoices(params);
      let list = [];
      let total = null;
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res.data)) {
        list = res.data;
        if (typeof res.total === "number") total = res.total;
      } else if (Array.isArray(res.invoices)) {
        list = res.invoices;
        if (typeof res.total === "number") total = res.total;
      } else if (Array.isArray(res.rows)) {
        list = res.rows;
        if (typeof res.total === "number") total = res.total;
      } else if (res && res.items && Array.isArray(res.items)) {
        list = res.items;
      }
      setInvoices(list);
      if (total !== null) setInvTotalRows(total);
    } catch (err) {
      console.error("fetchInvoices failed", err);
      setInvoices([]);
    } finally {
      setInvLoading(false);
    }
  }

  function pickParty(p) {
    setSelectedId(p.id ?? p._id);
    setMode("view");
    setForm(emptyForm());
  }

  function startAdd() {
    setMode("new");
    setForm(emptyForm());
    setErrorMsg("");
  }

  function startEdit() {
    if (!selectedParty) return;
    setMode("edit");
    setForm({
      name: selectedParty.name ?? "",
      phone: selectedParty.phone ?? "",
      email: selectedParty.email ?? "",
      billing_address: selectedParty.billing_address ?? selectedParty.address ?? "",
      notes: selectedParty.notes ?? "",
    });
    setErrorMsg("");
  }

  function cancelEdit() {
    setMode("view");
    setForm(emptyForm());
    setErrorMsg("");
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function handleSave(e) {
    e?.preventDefault();
    setErrorMsg("");
    if (!form.name || !form.name.trim()) {
      setErrorMsg("Name is required.");
      return;
    }

    const payload = {
      name: String(form.name).trim(),
      phone: form.phone || null,
      email: form.email || null,
      billing_address: form.billing_address || null,
      notes: form.notes || null,
    };

    setSaving(true);
    try {
      if (mode === "new") {
        await createParty(payload);
      } else if (mode === "edit" && selectedParty) {
        await updateParty(selectedParty.id ?? selectedParty._id, payload);
      }
      await loadParties();
      setMode("view");
      setForm(emptyForm());
    } catch (err) {
      console.error("Party save failed:", err);
      const msg = err?.response?.data?.error || err?.message || "Save failed";
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    try {
      await deleteParty(p.id ?? p._id);
      await loadParties();
      if (String(selectedId) === String(p.id ?? p._id)) setSelectedId(null);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Delete failed. See console.");
    }
  }

  // transactions utilities
  const totalVisibleAmount = useMemo(
    () => invoices.reduce((acc, inv) => acc + Number(inv.grand_total ?? inv.total_amount ?? inv.total ?? 0), 0),
    [invoices]
  );

  function exportVisibleCSV() {
    if (!invoices || !invoices.length) {
      alert("No rows to export.");
      return;
    }
    const headers = ["Date", "Invoice No", "Party", "Amount", "Invoice ID"];
    const rows = invoices.map((r) => [
      fmtDate(r.invoice_date ?? r.created_at ?? r.date ?? r.createdAt),
      r.invoice_no ?? r.invoiceNo ?? "",
      r.party_name ?? r.partyName ?? "",
      Number(r.grand_total ?? r.total_amount ?? r.total ?? 0).toFixed(2),
      r.id ?? r._id ?? "",
    ]);
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    csvDownload("invoices_export.csv", csv);
  }

  function printVisible() {
    const html = `
      <html><head><title>Invoices</title>
      <style>table{border-collapse:collapse;width:100%}th,td{border:1px solid #ddd;padding:8px}</style>
      </head><body>
      <h3>Invoices for ${selectedParty?.name ?? ""}</h3>
      <table>
        <thead><tr><th>Date</th><th>Invoice No</th><th>Party</th><th>Amount</th></tr></thead>
        <tbody>
        ${invoices
          .map(
            (r) =>
              `<tr><td>${fmtDate(r.invoice_date ?? r.created_at ?? r.date ?? r.createdAt)}</td><td>${String(
                r.invoice_no ?? r.invoiceNo ?? ""
              )}</td><td>${String(r.party_name ?? r.partyName ?? "")}</td><td style="text-align:right">${Number(
                r.grand_total ?? r.total_amount ?? r.total ?? 0
              ).toFixed(2)}</td></tr>`
          )
          .join("")}
        </tbody>
        <tfoot><tr><td colspan="3" style="text-align:right;font-weight:bold">Total</td><td style="text-align:right;font-weight:bold">${totalVisibleAmount.toFixed(
          2
        )}</td></tr></tfoot>
      </table>
      </body></html>
    `;
    const w = window.open("", "_blank");
    w.document.write(html);
    w.document.close();
    w.print();
  }

  // pagination controls
  const totalPages = invTotalRows ? Math.max(1, Math.ceil(invTotalRows / invPageSize)) : Math.max(1, Math.ceil((invoices.length || 0) / invPageSize));

  // Open invoice modal when user clicks View
  function openInvoiceModal(invoiceId) {
    setViewInvoiceId(invoiceId);
    setShowInvoiceModal(true);
  }
  function closeInvoiceModal() {
    setViewInvoiceId(null);
    setShowInvoiceModal(false);
  }

  // Called when invoice modal saves: reload transactions for selected party
  async function onInvoiceSaved(res) {
    try {
      // if invoice form returns the created/updated invoice id, we could pass it; but reload page for simplicity
      await loadInvoices();
    } catch (e) {
      console.error("Failed to refresh invoices after save", e);
    } finally {
      closeInvoiceModal();
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Parties</h1>
          <div>
            <button className="px-4 py-2 rounded bg-red-500 text-white" onClick={startAdd}>
              + Add Party
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow flex overflow-hidden" style={{ minHeight: 480 }}>
          {/* left list */}
          <div style={{ width: 340 }} className="border-r">
            <div className="p-4 border-b">
              <input
                placeholder="Search parties..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>

            <div className="overflow-auto" style={{ maxHeight: 760 }}>
              {loadingParties ? (
                <div className="p-4 text-center text-gray-600">Loading...</div>
              ) : parties.length === 0 ? (
                <div className="p-4 text-center text-gray-600">No parties</div>
              ) : (
                parties
                  .filter((p) => {
                    const q = (query || "").toLowerCase().trim();
                    if (!q) return true;
                    return (
                      String(p.name ?? "").toLowerCase().includes(q) ||
                      String(p.phone ?? "").toLowerCase().includes(q) ||
                      String(p.email ?? "").toLowerCase().includes(q)
                    );
                  })
                  .map((p) => {
                    const id = p.id ?? p._id;
                    const isSel = String(id) === String(selectedId);
                    return (
                      <div
                        key={id}
                        className={"cursor-pointer px-4 py-3 border-b " + (isSel ? "bg-green-50" : "hover:bg-gray-50")}
                        onClick={() => pickParty(p)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{p.name}</div>
                          <div className="text-sm text-green-600">{currencyFmt.format(Number(p.balance ?? 0))}</div>
                        </div>
                        <div className="mt-1 text-xs text-gray-600">{p.phone || p.email || ""}</div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* right panel: details + transactions */}
          <div className="flex-1 p-6">
            <div className="flex items-start justify-between">
              <div>
                {mode === "view" && selectedParty && <h2 className="text-xl font-semibold">{selectedParty.name}</h2>}
                {mode === "new" && <h2 className="text-xl font-semibold">Add Party</h2>}
                {mode === "edit" && <h2 className="text-xl font-semibold">Edit Party</h2>}
                {selectedParty && (
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedParty.phone || ""} {selectedParty.email ? `• ${selectedParty.email}` : ""}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 border rounded p-3 text-sm" style={{ minWidth: 260 }}>
                <div className="font-medium mb-1">Summary</div>
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <div>Visible invoices</div>
                  <div className="font-medium">{invoices.length}</div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
                  <div>Total (visible)</div>
                  <div className="font-medium">{currencyFmt.format(Number(totalVisibleAmount || 0))}</div>
                </div>
                <div className="mt-3">
                  <button className="px-3 py-1 border rounded mr-2" onClick={exportVisibleCSV} disabled={!invoices.length}>
                    Export CSV
                  </button>
                  <button className="px-3 py-1 border rounded" onClick={printVisible} disabled={!invoices.length}>
                    Print
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              {/* View details or form */}
              {mode === "view" && selectedParty && (
                <>
                  <div className="bg-white border rounded p-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Billing Address</div>
                        <div className="font-medium">{selectedParty.billing_address || "-"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Notes</div>
                        <div className="font-medium">{selectedParty.notes || "-"}</div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <button className="px-3 py-1 border rounded mr-2" onClick={startEdit}>
                        Edit
                      </button>
                      <button className="px-3 py-1 border rounded" onClick={() => handleDelete(selectedParty)}>
                        Delete
                      </button>
                    </div>
                  </div>

                  {/* Transactions table */}
                  <div className="mt-6 bg-white border rounded">
                    <div className="p-3 border-b flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-sm font-medium">Transactions</div>

                        <div className="text-xs text-gray-600">
                          <label className="mr-2">From</label>
                          <input type="date" value={""} onChange={() => {}} className="border px-2 py-1 rounded" />
                        </div>

                        <div className="text-xs text-gray-600">
                          <label className="mr-2">To</label>
                          <input type="date" value={""} onChange={() => {}} className="border px-2 py-1 rounded" />
                        </div>

                        <button className="px-2 py-1 border rounded text-sm" onClick={() => {}}>
                          Clear Dates
                        </button>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-gray-600">Page size</div>
                        <select value={invPageSize} onChange={(e) => { setInvPageSize(Number(e.target.value)); setInvPage(1); }} className="border p-1 rounded">
                          {[5,10,20,50].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="overflow-auto" style={{ maxHeight: 360 }}>
                      <table className="min-w-full">
                        <thead>
                          <tr className="text-left bg-gray-50">
                            <th className="p-3 text-xs">Date</th>
                            <th className="p-3 text-xs">Invoice No</th>
                            <th className="p-3 text-xs">Party</th>
                            <th className="p-3 text-xs text-right">Amount</th>
                            <th className="p-3 text-xs">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invLoading ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-600">Loading...</td></tr>
                          ) : invoices.length === 0 ? (
                            <tr><td colSpan="5" className="p-4 text-center text-gray-600">No invoices found</td></tr>
                          ) : (
                            invoices.map((inv) => (
                              <tr key={inv.id ?? inv._id} className="border-t">
                                <td className="p-3 text-sm">{fmtDate(inv.invoice_date ?? inv.created_at ?? inv.date)}</td>
                                <td className="p-3 text-sm">{inv.invoice_no ?? inv.invoiceNo ?? ""}</td>
                                <td className="p-3 text-sm">{inv.party_name ?? inv.partyName ?? selectedParty?.name}</td>
                                <td className="p-3 text-sm text-right">{currencyFmt.format(Number(inv.grand_total ?? inv.total_amount ?? inv.total ?? 0) || 0)}</td>
                                <td className="p-3 text-sm">
                                  <button className="px-2 py-1 border rounded text-xs mr-2" onClick={() => openInvoiceModal(inv.id ?? inv._id)}>
                                    View
                                  </button>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                        {!invLoading && invoices.length > 0 && (
                          <tfoot>
                            <tr className="border-t bg-gray-50">
                              <td colSpan="3" className="p-3 text-right font-medium">Page total</td>
                              <td className="p-3 text-right font-medium">{currencyFmt.format(Number(totalVisibleAmount || 0))}</td>
                              <td className="p-3"></td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>

                    {/* pagination */}
                    <div className="p-3 border-t flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {invTotalRows !== null ? `Total rows: ${invTotalRows}` : `Showing ${invoices.length} rows`}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="px-3 py-1 border rounded" onClick={() => { if (invPage > 1) { setInvPage(invPage - 1); loadInvoices(invPage - 1); } }} disabled={invPage <= 1}>Prev</button>
                        <div>Page {invPage} {invTotalRows !== null && ` / ${totalPages}`}</div>
                        <button className="px-3 py-1 border rounded" onClick={() => { setInvPage(invPage + 1); loadInvoices(invPage + 1); }} disabled={invTotalRows !== null && invPage >= totalPages}>Next</button>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* form for new/edit */}
              {(mode === "new" || mode === "edit") && (
                <form onSubmit={handleSave}>
                  {errorMsg && <div className="mb-3 text-sm text-red-600">{errorMsg}</div>}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Party Name</label>
                      <input name="name" value={form.name} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Phone</label>
                      <input name="phone" value={form.phone} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Email</label>
                      <input name="email" value={form.email} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Billing address</label>
                      <input name="billing_address" value={form.billing_address} onChange={handleChange} className="w-full border p-2 rounded" />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className="w-full border p-2 rounded" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div>
                      <button type="button" className="px-4 py-2 border rounded mr-2" onClick={cancelEdit}>Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded" disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                    <div className="text-sm text-gray-600">{mode === "new" ? "New party" : "Editing party"}</div>
                  </div>
                </form>
              )}

              {!selectedParty && mode === "view" && (
                <div className="text-gray-600">Select a party on the left or click "Add Party".</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Invoice modal overlay */}
      {showInvoiceModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 60,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={closeInvoiceModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded shadow-lg"
            style={{ width: "90%", maxWidth: 900, maxHeight: "90%", overflow: "auto", padding: 20 }}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Invoice</h3>
              <div>
                <button className="px-3 py-1 border rounded" onClick={closeInvoiceModal}>
                  Close
                </button>
              </div>
            </div>

            {/* InvoiceForm expects invoiceId, onSaved, onCancel */}
            <InvoiceForm
              invoiceId={viewInvoiceId}
              onSaved={onInvoiceSaved}
              onCancel={closeInvoiceModal}
            />
          </div>
        </div>
      )}
    </AppLayout>
  );
}
