import React, { useState } from 'react';

// SalesModule.jsx
// Single-file drop-in for your ERP app that contains:
// - SaleSidebar: left navigation with exact submenu order from your screenshot
// - SalesModule: top-level page that renders the sidebar + content area
// - SaleInvoicesPage: default page (invoice list) with +Add Sale button that opens InvoiceEditor
// - InvoiceEditor: the modal/full-editor we built earlier (integrated here)
// - Stubs: EstimatePage, ProformaInvoicePage, SaleOrderPage, DeliveryChallanPage, CreditNotePage
//
// How to use:
// - Save as src/pages/SalesModule.jsx
// - Import into your router or Dashboard: import SalesModule from './pages/SalesModule'
// - Render <SalesModule /> on the route for /sales or inside your Sales section.
//
// Notes:
// - This file intentionally keeps everything in one file for easy copy-paste and preview.
// - Later you can split each component into its own file (I can do that on request).
// - The InvoiceEditor currently uses in-memory demo data. I included hooks where you can
//   replace fetch/save with your API endpoints.

export default function SalesModule() {
  // The SalesModule is a *page* — it should not render a separate sidebar.
  // AppLayout provides the global Sidebar and Topbar. Keep SalesModule focused
  // on rendering the sales content region so it displays correctly inside AppLayout.
  const [activeTab, setActiveTab] = useState('sale-invoices');

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">Sales</h1>
        </div>

        {/* Content router */}
        {activeTab === 'sale-invoices' && <SaleInvoicesPage />}
        {activeTab === 'estimate' && <EstimatePage />}
        {activeTab === 'proforma' && <ProformaInvoicePage />}
        {activeTab === 'sale-order' && <SaleOrderPage />}
        {activeTab === 'delivery-challan' && <DeliveryChallanPage />}
        {activeTab === 'credit-note' && <CreditNotePage />}
      </div>
    </div>
  );
}

export function SaleSidebar({ active, onChange }) {
  const items = [
    { key: 'sale-invoices', label: 'Sale Invoices' },
    { key: 'estimate', label: 'Estimate / Quotations' },
    { key: 'proforma', label: 'Proforma Invoice' },
    { key: 'sale-order', label: 'Sale Order' },
    { key: 'delivery-challan', label: 'Delivery Challan' },
    { key: 'credit-note', label: 'Sale return/Credit Note' },
  ];

  return (
    <div className="space-y-2">
      <div className="mb-2">
        <div className="px-3 py-2 text-sm text-slate-500">Sale</div>
      </div>

      <div className="flex flex-col">
        {items.map((it) => (
          <button
            key={it.key}
            onClick={() => onChange(it.key)}
            className={`w-full text-left px-3 py-2 rounded-l-lg flex items-center justify-between ${active === it.key ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'}`}>
            <span>{it.label}</span>
            {active === it.key && <span className="text-xs text-slate-400">(open)</span>}
          </button>
        ))}

        <div className="mt-6 border-t pt-4 text-sm text-slate-600 space-y-2">
          <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Reports</button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Customers</button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-50">Products</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------- Pages -------------------------
function SaleInvoicesPage() {
  const [showEditor, setShowEditor] = useState(false);
  const [invoices, setInvoices] = useState(sampleInvoiceList());

  function openAdd() {
    setShowEditor(true);
  }

  function handleSaved(newInvoice) {
    // Add to list (demo). In real app, replace with fetch from server after save.
    setInvoices([newInvoice, ...invoices]);
    setShowEditor(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-medium">Sale Invoices</h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded bg-pink-500 text-white" onClick={openAdd}>+ Add Sale</button>
        </div>
      </div>

      <div className="bg-white rounded shadow p-4">
        <div className="text-sm text-slate-600 mb-3">Total Sales Amount</div>
        <div className="text-2xl font-semibold mb-4">₹ {invoices.reduce((s, i) => s + i.total, 0).toFixed(2)}</div>

        <table className="w-full table-auto text-sm">
          <thead className="text-left text-slate-600">
            <tr>
              <th className="px-2 py-2">Date</th>
              <th className="px-2 py-2">Invoice No</th>
              <th className="px-2 py-2">Party Name</th>
              <th className="px-2 py-2">Transaction</th>
              <th className="px-2 py-2">Amount</th>
              <th className="px-2 py-2">Balance</th>
              <th className="px-2 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="px-2 py-3">{inv.date}</td>
                <td className="px-2 py-3">{inv.number}</td>
                <td className="px-2 py-3">{inv.party}</td>
                <td className="px-2 py-3">Sale</td>
                <td className="px-2 py-3">₹ {inv.total.toFixed(2)}</td>
                <td className="px-2 py-3">₹ {inv.balance.toFixed(2)}</td>
                <td className="px-2 py-3">
                  <button className="px-2 py-1 rounded border mr-2" onClick={() => alert('View (demo)')}>📄</button>
                  <button className="px-2 py-1 rounded border" onClick={() => alert('Edit (demo)')}>✏️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showEditor && (
        <InvoiceEditor onSave={handleSaved} onClose={() => setShowEditor(false)} />
      )}
    </div>
  );
}

function EstimatePage() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-medium">Estimate / Quotations</h2>
      <p className="mt-2 text-sm text-slate-600">Work in progress — this page is a placeholder. I can implement list + add/edit flow like Sale Invoices.</p>
    </div>
  );
}

function ProformaInvoicePage() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-medium">Proforma Invoice</h2>
      <p className="mt-2 text-sm text-slate-600">Work in progress.</p>
    </div>
  );
}

function SaleOrderPage() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-medium">Sale Order</h2>
      <p className="mt-2 text-sm text-slate-600">Work in progress.</p>
    </div>
  );
}

function DeliveryChallanPage() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-medium">Delivery Challan</h2>
      <p className="mt-2 text-sm text-slate-600">Work in progress.</p>
    </div>
  );
}

function CreditNotePage() {
  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-xl font-medium">Sale return / Credit Note</h2>
      <p className="mt-2 text-sm text-slate-600">Work in progress.</p>
    </div>
  );
}

// ------------------------- Invoice Editor (integrated) -------------------------
function InvoiceEditor({ onSave = () => {}, onClose = () => {} }) {
  const [invoice, setInvoice] = useState(defaultInvoice());
  const [customers] = useState(sampleCustomers());
  const [products] = useState(sampleProducts());

  function save() {
    // simple validation
    if (!invoice.customer?.name) return alert('Select customer');

    // calculate final total and return the invoice object to parent
    const subtotal = invoice.items.reduce((s, it) => s + it.qty * it.rate, 0);
    const taxTotal = invoice.items.reduce((s, it) => s + ((it.qty * it.rate) * (it.taxPercent || 0) / 100), 0);
    const total = subtotal + taxTotal - (invoice.discount || 0);

    const out = { ...invoice, subtotal, taxTotal, total, balance: total };
    onSave(out);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="text-lg font-semibold">Invoice Editor</div>
            <div className="text-sm text-muted">Invoice #: {invoice.number} • {invoice.date}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1 rounded bg-slate-100" onClick={() => window.print()}>Print</button>
            <button className="px-3 py-1 rounded bg-slate-100" onClick={() => exportJSON(invoice)}>Export</button>
            <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={save}>Save</button>
            <button className="px-3 py-1 rounded border" onClick={onClose}>Close</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">Customer</label>
              <CustomerSelector customers={customers} value={invoice.customer} onChange={(c) => setInvoice({ ...invoice, customer: c })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Invoice Date</label>
              <input type="date" value={invoice.date} onChange={(e) => setInvoice({ ...invoice, date: e.target.value })} className="mt-1 block w-full rounded-md border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium">Due Date</label>
              <input type="date" value={invoice.dueDate} onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })} className="mt-1 block w-full rounded-md border p-2" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <LineItemsEditor items={invoice.items} onChange={(items) => setInvoice({ ...invoice, items })} products={products} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Notes</label>
              <textarea value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} className="mt-1 block w-full rounded-md border p-2 h-24" />
            </div>

            <div>
              <SummaryPanel invoice={invoice} onUpdate={(c) => setInvoice({ ...invoice, ...c })} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reuse earlier subcomponents (CustomerSelector, LineItemsEditor, SummaryPanel)
function CustomerSelector({ customers, value, onChange }) {
  return (
    <div className="flex gap-2">
      <select className="flex-1 rounded-md border p-2" value={value?.id || ''} onChange={(e) => onChange(customers.find(c => c.id === e.target.value) || null)}>
        <option value="">-- Select Customer --</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>
      <button className="px-3 py-1 rounded border" onClick={() => {
        const newCust = { id: 'c' + Date.now(), name: 'New Customer' };
        onChange(newCust);
      }}>Add</button>
    </div>
  );
}

function LineItemsEditor({ items, onChange, products }) {
  function updateItem(index, change) {
    const copy = items.map((it, i) => i === index ? { ...it, ...change } : it);
    onChange(copy);
  }

  function addRow() {
    onChange([...items, { id: 'i' + Date.now(), product: null, description: '', qty: 1, rate: 0, taxPercent: 0 }]);
  }

  function removeRow(index) {
    const copy = items.filter((_, i) => i !== index);
    onChange(copy);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">Items</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 rounded border" onClick={addRow}>Add Item</button>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((row, idx) => (
          <div key={row.id} className="grid grid-cols-12 gap-2 items-center bg-white p-2 rounded">
            <div className="col-span-5">
              <select className="w-full rounded border p-1" value={row.product?.id || ''} onChange={(e) => {
                const p = products.find(x => x.id === e.target.value) || null;
                updateItem(idx, { product: p, description: p ? p.name : row.description, rate: p ? p.rate : row.rate });
              }}>
                <option value="">-- Product/Service --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input value={row.description} onChange={(e) => updateItem(idx, { description: e.target.value })} className="mt-1 block w-full rounded border p-1" placeholder="Description" />
            </div>

            <div className="col-span-2">
              <input type="number" min="0" value={row.qty} onChange={(e) => updateItem(idx, { qty: Number(e.target.value) })} className="w-full rounded border p-1" />
            </div>

            <div className="col-span-2">
              <input type="number" min="0" value={row.rate} onChange={(e) => updateItem(idx, { rate: Number(e.target.value) })} className="w-full rounded border p-1" />
            </div>

            <div className="col-span-1">
              <input type="number" min="0" value={row.taxPercent} onChange={(e) => updateItem(idx, { taxPercent: Number(e.target.value) })} className="w-full rounded border p-1" />
            </div>

            <div className="col-span-1 text-right font-medium">{formatCurrency(row.qty * row.rate)}</div>

            <div className="col-span-1 text-right">
              <button className="px-2 py-1 rounded border" onClick={() => removeRow(idx)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SummaryPanel({ invoice, onUpdate }) {
  const subtotal = invoice.items.reduce((s, it) => s + (it.qty * it.rate), 0);
  const taxTotal = invoice.items.reduce((s, it) => s + ((it.qty * it.rate) * (it.taxPercent || 0) / 100), 0);
  const discount = invoice.discount || 0;
  const total = subtotal + taxTotal - discount;

  return (
    <div className="bg-white rounded p-4 shadow">
      <div className="flex justify-between mb-2"><div>Subtotal</div><div>{formatCurrency(subtotal)}</div></div>
      <div className="flex justify-between mb-2"><div>Tax</div><div>{formatCurrency(taxTotal)}</div></div>
      <div className="flex justify-between mb-2 items-center">
        <div>Discount</div>
        <div className="flex items-center gap-2">
          <input type="number" value={discount} onChange={(e) => onUpdate({ discount: Number(e.target.value) })} className="w-24 rounded border p-1" />
        </div>
      </div>
      <div className="border-t mt-2 pt-2 font-semibold flex justify-between"> <div>Total</div> <div>{formatCurrency(total)}</div></div>
    </div>
  );
}

// ------------------------- Helpers & Data -------------------------
function defaultInvoice() {
  const now = new Date();
  return {
    id: 'inv' + Date.now(),
    number: 'INV-' + ('' + Date.now()).slice(-6),
    date: now.toISOString().slice(0, 10),
    dueDate: '',
    customer: null,
    items: [],
    notes: '',
    discount: 0,
  };
}

function sampleInvoiceList() {
  return [
    { id: 'inv1', date: '14 Sept 2025', number: 'INV-001', party: 'ACME', total: 1000, balance: 1000 },
  ];
}

function formatCurrency(v) {
  return '₹ ' + Number(v || 0).toFixed(2);
}

function exportJSON(obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = (obj.number || 'invoice') + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function sampleCustomers() {
  return [
    { id: 'c1', name: 'Retail Customer' },
    { id: 'c2', name: 'SR Enterprises' },
  ];
}

function sampleProducts() {
  return [
    { id: 'p1', name: 'Product A', rate: 499 },
    { id: 'p2', name: 'Product B', rate: 1499 },
  ];
}