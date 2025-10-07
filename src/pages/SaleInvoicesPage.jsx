// src/pages/SaleInvoicesPage.jsx
import React, { useEffect, useState, useCallback, useMemo } from "react";
import InvoiceForm from "../components/InvoiceForm";
import { fetchInvoices, deleteInvoice } from "../api";
import { canonicalId } from "../utils/normalize"; // keep if used elsewhere
import { formatCurrencyINR } from "../utils/format";
import AppLayout from "../components/AppLayout";

/**
 * SaleInvoicesPage
 * - Table + summary
 * - Single modal used for both Add and Edit
 * - Inline edit panel removed (Edit now opens modal)
 */
export default function SaleInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);

  // modalMode: 'add' | 'edit' | null
  const [modalMode, setModalMode] = useState(null);
  const [modalInvoiceId, setModalInvoiceId] = useState(null);

  // modalMode/modalInvoiceId already exist in your component
const [modalVisible, setModalVisible] = useState(false); // controls mounting
const [modalActive, setModalActive] = useState(false);   // controls animation classes

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchInvoices({ limit: 100, sort: "-id" }).catch(() => null);
      let arr = [];
      if (res) {
        if (Array.isArray(res)) arr = res;
        else if (Array.isArray(res?.data)) arr = res.data;
        else if (Array.isArray(res?.invoices)) arr = res.invoices;
        else if (Array.isArray(res?.rows)) arr = res.rows;
      }
      setInvoices(Array.isArray(arr) ? arr : []);
    } catch (err) {
      console.error("Failed to load invoices", err);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const pageTotal = useMemo(
    () => invoices.reduce((s, inv) => s + Number(inv.total ?? inv.amount ?? 0), 0),
    [invoices]
  );

  useEffect(() => {
  function onKey(e) {
    if (e.key === "Escape" && modalVisible) closeModal();
  }
  if (modalVisible) {
    document.body.style.overflow = "hidden"; // lock scroll
    window.addEventListener("keydown", onKey);
  } else {
    document.body.style.overflow = ""; // restore
  }
  return () => {
    window.removeEventListener("keydown", onKey);
    document.body.style.overflow = "";
  };
}, [modalVisible]);

  // Open modal in "add" mode
  function handleOpenAdd() {
  setModalMode("add");
  setModalInvoiceId(null);
  setModalVisible(true);
  // next frame -> activate transitions
  requestAnimationFrame(() => setModalActive(true));
}

  // Open modal in "edit" mode for given id
  function handleOpenEdit(id) {
  setModalMode("edit");
  setModalInvoiceId(id);
  setModalVisible(true);
  requestAnimationFrame(() => setModalActive(true));
}

  // Close modal (reset)
  function closeModal() {
  // start exit animation
  setModalActive(false);
  // wait for animation to finish before unmounting
  setTimeout(() => {
    setModalVisible(false);
    setModalMode(null);
    setModalInvoiceId(null);
  }, 320); // match duration below (300ms)
}

  // Called after InvoiceForm saves successfully
  function handleSaved() {
    // reload list and close
    loadInvoices();
    closeModal();
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete invoice?")) return;
    try {
      await deleteInvoice(id);
      await loadInvoices();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed");
    }
  }

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-semibold">Sale Invoices</h2>
            <div className="text-sm text-slate-500">Total invoices: {invoices.length}</div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-xl font-bold">{formatCurrencyINR(pageTotal)}</div>
            <button
              onClick={handleOpenAdd}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded"
            >
              + Add Sale
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4 mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="p-3 text-left text-sm">Date</th>
                  <th className="p-3 text-left text-sm">Invoice no</th>
                  <th className="p-3 text-left text-sm">Party Name</th>
                  <th className="p-3 text-right text-sm">Amount</th>
                  <th className="p-3 text-center text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => (
                    <tr key={inv.id ?? inv._id} className="border-t hover:bg-slate-50">
                      <td className="p-3">
                        {new Date(inv.invoice_date ?? inv.created_at ?? inv.createdAt ?? Date.now()).toLocaleDateString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">{inv.invoice_no ?? inv.invoiceNo ?? ""}</td>
                      <td className="p-3">{inv.party_name ?? inv.partyName ?? inv.customer_name ?? ""}</td>
                      <td className="p-3 text-right">{formatCurrencyINR(inv.total ?? inv.amount ?? 0)}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleOpenEdit(inv.id ?? inv._id)}
                          className="px-2 py-1 border rounded mr-2 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(inv.id ?? inv._id)}
                          className="px-2 py-1 border rounded text-sm text-red-600"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit modal (animated fade + slide) */}
{modalVisible && (
  <div
    className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-320 ${
      modalActive ? "opacity-100" : "opacity-0"
    }`}
    aria-hidden={!modalActive}
  >
    {/* backdrop (click to close) */}
    <div
      className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-320 ${
        modalActive ? "opacity-100" : "opacity-0"
      }`}
      onClick={closeModal}
    />

    {/* modal panel */}
    <div
      className={`relative bg-white w-full max-w-3xl rounded shadow p-5 transform transition-all duration-320
        ${modalActive ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-95"}`}
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {modalMode === "add" ? "Add Sale" : "Edit Sale"}
        </h3>
        <button onClick={closeModal} className="text-slate-500 hover:text-slate-700">
          Close
        </button>
      </div>

      <InvoiceForm
        invoiceId={modalMode === "edit" ? modalInvoiceId : null}
        onSaved={() => {
          handleSaved(); // reloads list
          // close with animation
          closeModal();
        }}
        onCancel={() => closeModal()}
      />
    </div>
  </div>
)}
      </div>
    </AppLayout>
  );
}
