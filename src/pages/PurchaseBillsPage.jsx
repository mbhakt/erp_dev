import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Card, Button, message } from 'antd';
import BillHeader from '../components/BillHeader';
import EditableTable from '../components/EditableTable';
import TotalSummaryCard from '../components/TotalSummaryCard';
import BottomButtonBar from '../components/BottomButtonBar';
import * as api from '../api/index';
import { calcTax } from '../utils/gstCalc';
import dayjs from 'dayjs';

export default function PurchaseBillsPage() {
  const [rows, setRows] = useState([]);
  const [parties, setParties] = useState([]);
  const [header, setHeader] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadParties();
  }, []);

  async function loadParties() {
    try {
      const p = await (api.getParties ? api.getParties() : []);
      setParties(p || []);
    } catch (e) {
      console.error(e);
    }
  }

  const computeTotals = () => {
    const subtotal = rows.reduce((s, r) => s + (Number(r.qty || 0) * Number(r.rate || 0)), 0);
    const tax = rows.reduce((s, r) => s + calcTax(Number(r.qty || 0) * Number(r.rate || 0), Number(r.tax_percent || 0)), 0);
    const grand = +(subtotal + tax).toFixed(2);
    return { subtotal, tax, grand };
  };

  const handleSave = async (stay) => {
    setSaving(true);
    try {
      const payload = {
        bill_no: header.bill_no || 'PB-' + String(Date.now()).slice(-6),
        bill_date: header.bill_date ? dayjs(header.bill_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        party_id: header.party_id || null,
        payment_mode: header.payment_mode || 'Cash',
        items: rows.map((r) => ({ item_id: r.item_id, qty: r.qty, rate: r.rate, tax_percent: r.tax_percent })),
      };
      if (api.createPurchaseBill) await api.createPurchaseBill(payload);
      message.success('Saved');
      if (stay) {
        setRows([]);
      } else {
        // navigate back or refresh list - left intentionally simple
        window.location.reload();
      }
    } catch (e) {
      console.error(e);
      message.error('Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div style={{ padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Purchase Bills</h2>
          <Button onClick={() => window.location.reload()}>Refresh</Button>
        </div>

        <Card style={{ marginTop: 12 }}>
          <BillHeader parties={parties} onValuesChange={(vals) => setHeader(vals)} />
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <EditableTable rows={rows} setRows={setRows} items={[]} />
            </div>
            <div>
              <TotalSummaryCard {...computeTotals()} />
            </div>
          </div>
        </Card>

        <BottomButtonBar
          onSaveExit={() => handleSave(false)}
          onSaveNew={() => handleSave(true)}
          onDelete={() => {}}
          onClear={() => {
            setRows([]);
            setHeader({});
          }}
          onExit={() => window.history.back()}
          loading={saving}
        />
      </div>
    </AppLayout>
  );
}
