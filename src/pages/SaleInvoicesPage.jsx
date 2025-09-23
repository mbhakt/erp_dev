// src/pages/SaleInvoicesPage.jsx
import React, { useState, useEffect } from "react";
import SharedTable from "../components/SharedTable";
import AppLayout from "../components/AppLayout";
import InvoiceForm from "../components/InvoiceForm";
 import {
   fetchInvoices,
   createInvoice,
   updateInvoice,
   deleteInvoice,
 } from "../api";

export default function SaleInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [editing, setEditing] = useState(null);

  async function loadInvoices() {
    try {
      const data = await fetchInvoices();
      setInvoices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load invoices:", err);
    }
  }

  useEffect(() => {
    loadInvoices();
  }, []);

  function handleAdd() {
    setEditing(null);
    setOpenEditor(true);
  }

  function handleEdit(row) {
    setEditing(row);
    setOpenEditor(true);
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this invoice?")) return;
    try {
      await deleteInvoice(id);
      loadInvoices();
    } catch (err) {
      console.error("Failed to delete invoice:", err);
    }
  }

  async function handleSave(payload) {
    try {
      if (editing?.id) {
        await updateInvoice(editing.id, payload);
      } else {
        await createInvoice(payload);
      }
      setOpenEditor(false);
      setEditing(null);
      loadInvoices();
    } catch (err) {
      console.error("Save failed:", err);
    }
  }

  const columns = [
    { key: "invoice_date", label: "Date" },
    { key: "invoice_no", label: "Invoice no" },
    { key: "party_name", label: "Party Name" },
    { key: "total_amount", label: "Amount" },
  ];

  return (
    <AppLayout>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-semibold">Sale Invoices</h1>
          <div>
            <button
              className="px-4 py-2 rounded bg-pink-500 text-white"
              onClick={handleAdd}
            >
              + Add Sale
            </button>
          </div>
        </div>

        <div className="bg-white rounded shadow p-4">
          <div className="mb-4 text-sm text-slate-600">Total Sales Amount</div>
          <div className="text-2xl font-semibold mb-4">
            ₹ {invoices
              .reduce((s, i) => s + (i.total_amount || 0), 0)
              .toFixed(2)}
          </div>

          <SharedTable
            columns={columns}
            data={invoices}
            actions={(row) => (
              <>
                <button
                  className="px-2 py-1 rounded border mr-2"
                  onClick={() => handleEdit(row)}
                >
                  Edit
                </button>
                <button
                  className="px-2 py-1 rounded border"
                  onClick={() => handleDelete(row.id)}
                >
                  Delete
                </button>
              </>
            )}
          />
        </div>

        {openEditor && (
          <InvoiceForm
            open={true}
            invoice={editing}
            onClose={() => {
              setOpenEditor(false);
              setEditing(null);
            }}
            onSave={handleSave}
          />
        )}
      </div>
    </AppLayout>
  );
}
