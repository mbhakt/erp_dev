// src/pages/SaleInvoicesPage.jsx
import React, { useState, useEffect } from "react";
import SharedTable from "../components/SharedTable";
import AppLayout from "../components/AppLayout";
import InvoiceForm from "../components/InvoiceForm";
 import {
   fetchInvoices,
   fetchItems,
   createInvoice,
   updateInvoice,
   deleteInvoice,
 } from "../api";

export default function SaleInvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [openEditor, setOpenEditor] = useState(false);
  const [editing, setEditing] = useState(null);
  const [items, setItems] = useState([]);
  
  // Helper: return invoice amount from different possible fields or compute from lines
const getInvoiceAmount = (inv) => {
  if (!inv) return 0;
  // direct known fields
  if (Number.isFinite(Number(inv.grand_total))) return Number(inv.grand_total);
  if (Number.isFinite(Number(inv.total_amount))) return Number(inv.total_amount);
  if (Number.isFinite(Number(inv.amount))) return Number(inv.amount);
  if (Number.isFinite(Number(inv.total))) return Number(inv.total);

  // sometimes the API returns nested summaries:
  if (inv.summary && Number.isFinite(Number(inv.summary.grand_total))) return Number(inv.summary.grand_total);

  // if there are line items, compute: sum(qty * rate) + tax if present
  const lines = inv.lines || inv.items || inv.invoice_lines || [];
  if (Array.isArray(lines) && lines.length) {
    let subtotal = 0;
    let taxtotal = 0;
    for (const l of lines) {
      const qty = Number(l.qty ?? l.quantity ?? 0) || 0;
      const rate = Number(l.rate ?? l.unit_price ?? l.price ?? 0) || 0;
      const lineTotal = qty * rate;
      subtotal += lineTotal;
      // tax may be given directly or as taxPercent
      if (l.tax_amount !== undefined && Number.isFinite(Number(l.tax_amount))) {
        taxtotal += Number(l.tax_amount);
      } else if (l.taxPercent !== undefined || l.tax_rate !== undefined) {
        const pct = Number(l.taxPercent ?? l.tax_rate ?? 0) || 0;
        taxtotal += (lineTotal * pct) / 100;
      }
    }
    return Number((subtotal + taxtotal).toFixed(2));
  }

  // final fallback
  return 0;
};

// format date as DD-MM-YYYY
const formatDateDDMMYYYY = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d)) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

// currency formatter (India/Rupee) with two decimals
const fmt = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

async function loadItems() {
  try {
    const data = await fetchItems();
    setItems(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Failed to load items:", err);
  }
}

  async function loadInvoices() {
  try {
    const data = await fetchInvoices();
    const arr = Array.isArray(data) ? data : [];

    // compute amount and formatted display for each invoice
    const withAmount = arr.map((inv) => {
      const numeric = getInvoiceAmount(inv) || 0;
      // ensure number with two decimals for arithmetic
      const numericTwo = Number(Number(numeric).toFixed(2));
      return {
        ...inv,
        // numeric amount used for totals / computations
        amount: numericTwo,
        // preformatted react node to let SharedTable render correctly and align right
        amount_display: (
          <div style={{ textAlign: "right" }}>
            {fmt.format(numericTwo)}
          </div>
        ),
      };
    });

    setInvoices(withAmount);
  } catch (err) {
    console.error("Failed to load invoices:", err);
  }
}

  useEffect(() => {
    loadInvoices();
    loadItems();
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
  {
    key: "invoice_date",
    label: "Date",
    render: (row) => <div>{formatDateDDMMYYYY(row.invoice_date)}</div>,
  },
  { key: "invoice_no", label: "Invoice no" },
  { key: "party_name", label: "Party Name" },
  {
    key: "amount_display", // SharedTable will call render if present; we prepared amount_display earlier
    label: <div style={{ textAlign: "right" }}>Amount</div>,
    // If you didn't create amount_display, use render to format numeric amount:
    render: (row) => <div style={{ textAlign: "right" }}>{fmt.format(row.amount || getInvoiceAmount(row) || 0)}</div>,
  },
];

// compute total using numeric `amount`
const totalSales = invoices.reduce((s, i) => s + Number(i.amount || 0), 0);

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
  {fmt.format(totalSales)}
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
            items={items}
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
