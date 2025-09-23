// src/pages/InvoicesPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import AppLayout from "../components/AppLayout";
import InvoiceForm from "../components/InvoiceForm";
import {
  fetchInvoices,
  fetchInvoice,
  deleteInvoice,
} from "../api";

/**
 * InvoicesPage (full-featured)
 *
 * Features:
 * - fetch & display invoices
 * - search, date-range filter
 * - client-side pagination + page-size control
 * - totals (visible / overall)
 * - add (open modal), edit (load invoice -> modal), delete (single + bulk)
 * - export visible rows (CSV / JSON)
 * - keyboard shortcut: 'n' => new invoice
 */
export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // UI state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Filters
  const [q, setQ] = useState(""); // search
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Sort (client-side)
  const [sortKey, setSortKey] = useState("invoice_date");
  const [sortDir, setSortDir] = useState("desc"); // 'asc' | 'desc'

  // load invoices
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInvoices();
      setInvoices(Array.isArray(data) ? data : []);
      setSelectedIds(new Set());
      setPage(1);
    } catch (err) {
      console.error("fetchInvoices failed:", err);
      setError("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // keyboard shortcut: 'n' to add
  useEffect(() => {
    function onKey(e) {
      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleAdd();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // utilities
  function formatDate(d) {
    if (!d) return "-";
    const dt = new Date(d);
    if (isNaN(dt)) return d;
    // dd-mm-yyyy
    return dt.toLocaleDateString("en-GB");
  }

  function matchesSearch(inv, qLower) {
    if (!qLower) return true;
    // search invoice_no, party_name, customer_name and invoice id/notes
    if ((inv.invoice_no || "").toLowerCase().includes(qLower)) return true;
    if ((inv.party_name || inv.customer_name || "").toLowerCase().includes(qLower)) return true;
    if (String(inv.id).includes(qLower)) return true;
    return false;
  }

  // client-side filtering
  const filtered = useMemo(() => {
    const qLower = q.trim().toLowerCase();
    return invoices.filter(inv => {
      if (!matchesSearch(inv, qLower)) return false;
      if (fromDate) {
        const fd = new Date(fromDate);
        const idt = new Date(inv.invoice_date);
        if (isFinite(fd.getTime()) && isFinite(idt.getTime()) && idt < fd) return false;
      }
      if (toDate) {
        const td = new Date(toDate);
        const idt = new Date(inv.invoice_date);
        if (isFinite(td.getTime()) && isFinite(idt.getTime()) && idt > td) return false;
      }
      return true;
    });
  }, [invoices, q, fromDate, toDate]);

  // sorting
  const sorted = useMemo(() => {
    const arr = filtered.slice();
    arr.sort((a, b) => {
      const va = a[sortKey] ?? "";
      const vb = b[sortKey] ?? "";
      if (sortKey === "invoice_date") {
        const da = new Date(va).getTime() || 0;
        const db = new Date(vb).getTime() || 0;
        return sortDir === "asc" ? da - db : db - da;
      }
      // numeric vs string fallbacks
      if (typeof va === "number" && typeof vb === "number") {
        return sortDir === "asc" ? va - vb : vb - va;
      }
      return sortDir === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  // pagination
  const totalRows = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // totals
  const visibleTotal = pageData.reduce((s, r) => s + Number(r.total || 0), 0);
  const overallTotal = invoices.reduce((s, r) => s + Number(r.total || 0), 0);

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (copy.has(id)) copy.delete(id); else copy.add(id);
      return copy;
    });
  }

  function selectAllVisible(checked) {
    setSelectedIds(prev => {
      const copy = new Set(prev);
      if (checked) {
        pageData.forEach(r => copy.add(r.id));
      } else {
        pageData.forEach(r => copy.delete(r.id));
      }
      return copy;
    });
  }

  // actions
  function handleAdd() {
    setEditingInvoice(null);
    setModalOpen(true);
  }

  async function handleEdit(row) {
    try {
      const inv = await fetchInvoice(row.id);
      setEditingInvoice(inv);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch invoice for edit:", err);
      alert("Failed to load invoice for edit");
    }
  }

  async function handleDeleteOne(row) {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(row.id);
      await loadInvoices();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  }

  async function handleBulkDelete() {
    if (selectedIds.size === 0) return alert("No invoices selected");
    if (!window.confirm(`Delete ${selectedIds.size} invoices?`)) return;
    try {
      // sequential deletes; for speed you could use Promise.all but keep it simple
      for (const id of Array.from(selectedIds)) {
        await deleteInvoice(id);
      }
      await loadInvoices();
    } catch (err) {
      console.error("Bulk delete failed", err);
      alert("Bulk delete failed");
    } finally {
      setSelectedIds(new Set());
    }
  }

  // export visible rows to CSV / JSON
  function exportToJson() {
    const payload = pageData;
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_page_${currentPage}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportToCsv() {
    const header = ["id", "invoice_no", "party", "date", "total"];
    const rowsCsv = pageData.map(r => [
      r.id,
      `"${(r.invoice_no || "").replace(/"/g, '""')}"`,
      `"${((r.party_name || r.customer_name) || "").replace(/"/g, '""')}"`,
      `"${formatDate(r.invoice_date)}"`,
      (Number(r.total || 0)).toFixed(2)
    ].join(","));
    const csv = [header.join(","), ...rowsCsv].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `invoices_page_${currentPage}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function changeSort(key) {
    if (sortKey === key) {
      setSortDir(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Invoices</h1>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-600">
              Overall total: <span className="font-semibold">₹ {overallTotal.toFixed(2)}</span>
            </div>

            <button className="bg-green-600 text-white px-3 py-2 rounded" onClick={handleAdd}>+ Add</button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border rounded p-4 mb-4">
          <div className="grid grid-cols-4 gap-3">
            <input
              placeholder="Search invoice no / party"
              className="p-2 border rounded"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
            <div>
              <label className="text-xs text-gray-600">From</label>
              <input type="date" className="w-full p-2 border rounded" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-gray-600">To</label>
              <input type="date" className="w-full p-2 border rounded" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
            <div className="flex items-end gap-2">
              <button className="px-3 py-2 border rounded" onClick={() => { setQ(""); setFromDate(""); setToDate(""); }}>Reset</button>
              <button className="px-3 py-2 bg-gray-100 rounded" onClick={() => { setPage(1); }}>Apply</button>
            </div>
          </div>
        </div>

        {/* Table controls */}
        <div className="flex items-center justify-between mb-3 gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Page size</label>
            <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))} className="p-1 border rounded">
              {[6, 12, 24, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>

            <button className="px-2 py-1 border rounded" onClick={() => { setSelectedIds(new Set()); setPage(1); loadInvoices(); }}>Refresh</button>
            <button className="px-2 py-1 border rounded" onClick={exportToCsv}>Export CSV</button>
            <button className="px-2 py-1 border rounded" onClick={exportToJson}>Export JSON</button>
            <button className="px-2 py-1 border rounded text-red-600" onClick={handleBulkDelete}>Delete selected</button>
          </div>

          <div className="text-sm text-gray-600">
            Visible total: <span className="font-semibold">₹ {visibleTotal.toFixed(2)}</span>
            <span className="ml-4">Rows: {totalRows}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border rounded overflow-x-auto">
          {loading ? (
            <div className="p-6 text-gray-600">Loading...</div>
          ) : error ? (
            <div className="p-6 text-red-600">{error}</div>
          ) : totalRows === 0 ? (
            <div className="p-6 text-gray-500">No invoices found.</div>
          ) : (
            <table className="min-w-full">
              <thead>
                <tr className="text-left bg-gray-100">
                  <th className="p-2 border w-10">
                    <input
                      type="checkbox"
                      onChange={e => selectAllVisible(e.target.checked)}
                      checked={pageData.every(r => selectedIds.has(r.id))}
                    />
                  </th>
                  <th className="p-2 border cursor-pointer" onClick={() => changeSort("invoice_no")}>Invoice No {sortKey === "invoice_no" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                  <th className="p-2 border cursor-pointer" onClick={() => changeSort("party_name")}>Party {sortKey === "party_name" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                  <th className="p-2 border cursor-pointer" onClick={() => changeSort("invoice_date")}>Date {sortKey === "invoice_date" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                  <th className="p-2 border text-right cursor-pointer" onClick={() => changeSort("total")}>Total {sortKey === "total" ? (sortDir === "asc" ? "▲" : "▼") : ""}</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="p-2 border">
                      <input type="checkbox" checked={selectedIds.has(row.id)} onChange={() => toggleSelect(row.id)} />
                    </td>
                    <td className="p-2 border">{row.invoice_no}</td>
                    <td className="p-2 border">{row.party_name || row.customer_name || "-"}</td>
                    <td className="p-2 border">{formatDate(row.invoice_date)}</td>
                    <td className="p-2 border text-right">₹ {Number(row.total || 0).toFixed(2)}</td>
                    <td className="p-2 border">
                      <button className="text-sm text-blue-600 mr-2" onClick={() => handleEdit(row)}>Edit</button>
                      <button className="text-sm text-red-600" onClick={() => handleDeleteOne(row)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">
            Page {currentPage} / {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-2 py-1 border rounded" disabled={currentPage <= 1} onClick={() => setPage(1)}>First</button>
            <button className="px-2 py-1 border rounded" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)}>Prev</button>
            <button className="px-2 py-1 border rounded" disabled={currentPage >= totalPages} onClick={() => setPage(currentPage + 1)}>Next</button>
            <button className="px-2 py-1 border rounded" disabled={currentPage >= totalPages} onClick={() => setPage(totalPages)}>Last</button>
          </div>
        </div>

        {/* Modal */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
            <div className="relative z-10 bg-white rounded shadow-xl w-[1000px] max-w-full p-4">
              <InvoiceForm
                invoice={editingInvoice}
                onSave={() => {
                  setModalOpen(false);
                  setEditingInvoice(null);
                  loadInvoices();
                }}
                onClose={() => {
                  setModalOpen(false);
                  setEditingInvoice(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
