import React, { useEffect, useState } from "react";
import { fetchParties, fetchItems, createInvoice } from "../api";
import { useNavigate } from "react-router-dom";

export default function InvoiceForm(){
  const [parties,setParties] = useState([]);
  const [items,setItems] = useState([]);
  const [rows,setRows] = useState([{ item_id: '', qty:1, unit_price:0, discount:0 }]);
  const [form,setForm] = useState({ invoice_no: `INV-${Date.now()}`, party_id:'', invoice_date: new Date().toISOString().slice(0,10), notes: '' });
  const nav = useNavigate();

  useEffect(()=>{
    fetchParties().then(setParties).catch(console.error);
    fetchItems().then(setItems).catch(console.error);
  },[]);

  function updateRow(idx, changes){
    setRows(r => r.map((row,i)=> i===idx ? {...row, ...changes} : row));
  }
  function addRow(){ setRows(r => [...r, { item_id:'', qty:1, unit_price:0, discount:0 }]); }
  function removeRow(idx){ setRows(r => r.filter((_,i) => i !== idx)); }

  async function save(){
  // Basic client-side validation
  if(!form.party_id) return alert('Choose party');

  // Validate rows
  if(!rows || rows.length === 0) return alert('Add at least one item');
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.item_id) return alert(`Choose item for row ${i+1}`);
    if (!r.qty || Number(r.qty) <= 0) return alert(`Quantity must be > 0 for row ${i+1}`);
  }

  // Build payload converting ids/nums
  const itemsPayload = rows.map(r => ({
    item_id: Number(r.item_id),              // numeric id
    qty: Number(r.qty),
    unit_price: Number(r.unit_price || 0),
    discount: Number(r.discount || 0)
  }));

  // compute total same as server
  const total = itemsPayload.reduce((sum, it) => {
    const line = (Number(it.unit_price || 0) * Number(it.qty || 0)) - Number(it.discount || 0);
    return sum + line;
  }, 0);

  const payload = {
    invoice_no: form.invoice_no,
    party_id: Number(form.party_id),          // numeric id
    invoice_date: form.invoice_date,
    notes: form.notes || '',
    items: itemsPayload,
    total_amount: total                       // optional — server recalculates but okay to send for debugging
  };

  try{
    const created = await createInvoice(payload);
    console.log('invoice created', created);
    alert('Invoice created');
    nav('/');
  }catch(err){
    // attempt to show server error message
    console.error('Create invoice failed', err);
    let msg = 'Failed to create invoice';
    if (err?.response?.data) {
      // axios error: server returned JSON
      msg = err.response.data.error || JSON.stringify(err.response.data);
    } else if (err?.message) {
      msg = err.message;
    }
    alert(`${msg}`);
  }
}

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">New Invoice</h2>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <input className="border p-2" value={form.invoice_no} onChange={e=> setForm({...form, invoice_no:e.target.value})} />
        <input className="border p-2" type="date" value={form.invoice_date} onChange={e=> setForm({...form, invoice_date:e.target.value})} />
        <select className="border p-2" value={form.party_id} onChange={e=> setForm({...form, party_id:e.target.value})}>
          <option value="">-- Select Party --</option>
          {parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <input className="border p-2" placeholder="Notes" value={form.notes} onChange={e=> setForm({...form, notes:e.target.value})} />
      </div>

      <div className="mb-4">
        <table className="min-w-full">
          <thead>
            <tr><th>Item</th><th>Qty</th><th>Rate</th><th>Discount</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={idx}>
                <td className="pr-2 py-2">
                  <select className="border p-1" value={r.item_id} onChange={e=>{
                     const selected = items.find(it => String(it.id) === e.target.value);
                     updateRow(idx, { item_id: e.target.value, unit_price: selected ? selected.sale_price : 0 });
                  }}>
                    <option value="">-- select item --</option>
                    {items.map(it => <option key={it.id} value={it.id}>{it.name} ({it.sku})</option>)}
                  </select>
                </td>
                <td className="pr-2 py-2">
                  <input type="number" className="border p-1 w-20" value={r.qty} onChange={e=> updateRow(idx, { qty: Number(e.target.value) })} />
                </td>
                <td className="pr-2 py-2">
                  <input type="number" className="border p-1 w-28" value={r.unit_price} onChange={e=> updateRow(idx, { unit_price: Number(e.target.value) })} />
                </td>
                <td className="pr-2 py-2">
                  <input type="number" className="border p-1 w-28" value={r.discount} onChange={e=> updateRow(idx, { discount: Number(e.target.value) })} />
                </td>
                <td className="py-2">
                  <button className="px-2 py-1 border rounded" onClick={()=> removeRow(idx)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-2">
          <button className="px-3 py-1 bg-gray-100 rounded" onClick={addRow}>Add item</button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={save}>Save Invoice</button>
      </div>
    </div>
  );
}
