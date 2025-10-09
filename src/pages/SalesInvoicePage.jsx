import React, {useEffect, useState} from 'react';
import AppLayout from '../components/AppLayout';
import { Card, Button, message } from 'antd';
import BillHeader from '../components/BillHeader';
import EditableTable from '../components/EditableTable';
import TotalSummaryCard from '../components/TotalSummaryCard';
import BottomButtonBar from '../components/BottomButtonBar';
import PrintPreviewModal from '../components/PrintPreviewModal';
import * as api from '../api/index';
import dayjs from 'dayjs';

export default function SalesInvoicePage(){
  const [rows, setRows] = useState([]);
  const [parties, setParties] = useState([]);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  const [invoicePreview, setInvoicePreview] = useState(null);

  useEffect(()=>{ loadParties(); },[]);
  async function loadParties(){ try{ const p = await (api.fetchParties?api.fetchParties():[]); setParties(p||[]); }catch(e){} }

  const computeTotals = ()=> {
    const subtotal = rows.reduce((s,r)=>s + (Number(r.qty||0)*Number(r.rate||0)),0);
    const tax = rows.reduce((s,r)=> s + (Number(r.qty||0)*Number(r.rate||0) * (Number(r.tax_percent||0)/100)),0);
    const grand = +(subtotal + tax).toFixed(2);
    return {subtotal, tax, grand};
  };

  const handleSave = async (stay)=> {
    setSaving(true);
    try{
      const payload = { invoice_no: 'INV-' + String(Date.now()).slice(-6), date: dayjs().format('YYYY-MM-DD'), party_id: rows[0]?.party_id || null, items: rows.map(r=>({item_id:r.item_id, qty:r.qty, rate:r.rate, tax_percent:r.tax_percent})) };
      await api.createSale(payload);
      message.success('Saved');
      const totals = computeTotals();
      setInvoicePreview({company:'Company', partyName:'Party', partyGst:'', invoice_no:payload.invoice_no, date:payload.date, items:payload.items.map((it,i)=>({name:'Item '+(i+1), qty:it.qty, rate:it.rate, amount: (it.qty*it.rate)})), subtotal:totals.subtotal, tax:totals.tax, grand:totals.grand});
      setPreview(true);
      if (stay) { setRows([]); } else { /* navigate back */ }
    }catch(e){ message.error('Save failed'); } finally { setSaving(false); }
  };

  return (
    <AppLayout>
      <div style={{padding:16}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <h2>Sales Invoices</h2>
          <Button onClick={()=>setPreview(true)}>Print Preview</Button>
        </div>
        <Card style={{marginTop:12}}>
          <BillHeader form={{}} parties={parties} />
          <div style={{display:'flex', gap:12}}>
            <div style={{flex:1}}>
              <EditableTable rows={rows} setRows={setRows} items={[]}/>
            </div>
            <div>
              <TotalSummaryCard {...computeTotals()} />
            </div>
          </div>
        </Card>

        <BottomButtonBar
          onSaveExit={()=>handleSave(false)}
          onSaveNew={()=>handleSave(true)}
          onDelete={()=>{}}
          onClear={()=>setRows([])}
          onExit={()=>window.history.back()}
          loading={saving}
        />

        <PrintPreviewModal open={preview} onClose={()=>setPreview(false)} invoice={invoicePreview} />
      </div>
    </AppLayout>
  );
}