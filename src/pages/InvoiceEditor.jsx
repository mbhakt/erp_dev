import React, { useState, useEffect, useRef } from 'react';

// InvoiceEditor.jsx
// Single-file React component that contains:
// - SaleMenu with submenus (from V5.jpg requirements)
// - InvoiceEditor modal/page (expanded Sale modal -> full editor like V6.jpg)
// - Line item editing, tax, discounts, customer selector, notes, save/print/export actions
// Styling uses Tailwind utility classes (no external CSS required). Designed to be dropped
// into an existing React app. Default export is a single component that renders both
// the Sale menu and a toggleable Invoice editor.

export default function InvoiceEditor() {
  const [showEditor, setShowEditor] = useState(false);
  const [invoice, setInvoice] = useState(defaultInvoice());
  const [customers, setCustomers] = useState(sampleCustomers());
  const [products, setProducts] = useState(sampleProducts());
  const fileRef = useRef(null);

  useEffect(() => {
    // placeholder: load customers/products from API if available
  }, []);

  function openNewInvoice() {
    setInvoice(defaultInvoice());
    setShowEditor(true);
  }

  function openEditInvoice(existing) {
    setInvoice({ ...existing });
    setShowEditor(true);
  }

  function onClose() {
    setShowEditor(false);
  }

  function onSave() {
    // Validate minimal fields
    if (!invoice.customer?.name) {
      alert('Please select a customer.');
      return;
    }
    // In a real app: send to backend. Here we just console.log.
    console.log('Saving invoice', invoice);
    alert('Invoice saved (demo).');
    setShowEditor(false);
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Sales</h2>
        <div className="flex gap-2">
          <SaleMenu onNew={openNewInvoice} onOpenExample={() => openEditInvoice(sampleInvoice())} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4 rounded-2xl shadow-sm">
          <h3 className="font-medium mb-2">Recent Invoices (demo)</h3>
          <div className="text-sm text-muted">No invoices yet. Click "New Sale" to create one.</div>
        </div>

        <div className="card p-4 rounded-2xl shadow-sm">
          <h3 className="font-medium mb-2">Shortcuts</h3>
          <div className="flex gap-2 flex-wrap">
            <button className="px-3 py-1 rounded-lg border" onClick={openNewInvoice}>New Sale</button>
            <button className="px-3 py-1 rounded-lg border" onClick={() => alert('Open Register (demo)')}>Open Register</button>
            <button className="px-3 py-1 rounded-lg border" onClick={() => alert('Reports (demo)')}>Reports</button>
          </div>
        </div>
      </div>

      {/* Editor Drawer / Modal */}
      {showEditor && (
        <div className="fixed inset-0 z-40 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <div className="text-lg font-semibold">Invoice Editor</div>
                <div className="text-sm text-muted">Invoice #: {invoice.number} • {invoice.date}</div>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1 rounded bg-slate-100" onClick={() => { window.print(); }}>Print</button>
                <button className="px-3 py-1 rounded bg-slate-100" onClick={() => exportJSON(invoice)}>Export</button>
                <button className="px-3 py-1 rounded bg-green-600 text-white" onClick={onSave}>Save</button>
                <button className="px-3 py-1 rounded border" onClick={onClose}>Close</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">Customer</label>
                  <CustomerSelector
                    customers={customers}
                    value={invoice.customer}
                    onChange={(c) => setInvoice({ ...invoice, customer: c })}
                    products={products}
                  />
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
                <LineItemsEditor
                  items={invoice.items}
                  onChange={(items) => setInvoice({ ...invoice, items })}
                  products={products}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">Notes</label>
                  <textarea value={invoice.notes} onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })} className="mt-1 block w-full rounded-md border p-2 h-24" />
                </div>

                <div>
                  <SummaryPanel invoice={invoice} onUpdate={(changes) => setInvoice({ ...invoice, ...changes })} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SaleMenu({ onNew = () => {}, onOpenExample = () => {} }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button className="px-4 py-2 rounded-lg bg-indigo-600 text-white" onClick={() => setOpen(!open)}>Sale</button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border p-2 z-50">
          <MenuItem label="New Sale" onClick={() => { onNew(); setOpen(false); }} />
          <MenuItem label="Open Sale Register" onClick={() => { alert('Open Register (demo)'); setOpen(false); }} />
          <MenuItem label="Drafts" onClick={() => { alert('Open Draft list'); setOpen(false); }} />
          <MenuItem label="Invoice List" onClick={() => { alert('Open Invoice list'); setOpen(false); }} />
          <MenuItem label="Receipt / Payment" onClick={() => { alert('Payments (demo)'); setOpen(false); }} />
          <div className="border-t my-2"></div>
          <MenuItem label="Open Example Invoice (V6)" onClick={() => { onOpenExample(); setOpen(false); }} />
        </div>
      )}
    </div>
  );
}

function MenuItem({ label, onClick }) {
  return (
    <button className="w-full text-left px-3 py-2 rounded hover:bg-slate-50" onClick={onClick}>{label}</button>
  );
}

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

// Helpers & sample data
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

function sampleInvoice() {
  const inv = defaultInvoice();
  inv.customer = sampleCustomers()[0];
  inv.items = [{ id: 'i1', product: sampleProducts()[0], description: sampleProducts()[0].name, qty: 2, rate: sampleProducts()[0].rate, taxPercent: 18 }];
  inv.notes = 'Sample invoice from V6 mock';
  return inv;
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
