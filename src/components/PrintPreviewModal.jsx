import React from 'react';
import { Modal, Table } from 'antd';
import { currencyINR } from '../utils/currencyINR';
import { numberToWords } from '../utils/numberToWords';
export default function PrintPreviewModal({ open, onClose, invoice }) {
  const columns = [{title:'Item',dataIndex:'name'},{title:'Qty',dataIndex:'qty'},{title:'Rate',dataIndex:'rate',render:v=>currencyINR(v)},{title:'Amount',dataIndex:'amount',render:v=>currencyINR(v)}];
  const items = (invoice?.items||[]).map(it=>({name:it.name,qty:it.qty,rate:it.rate,amount:it.amount}));
  return (
    <Modal open={open} title={`Invoice ${invoice?.invoice_no||''}`} onCancel={onClose} footer={null} width={800}>
      <div style={{display:'flex', justifyContent:'space-between', marginBottom:12}}>
        <div>
          <h3>{invoice?.company||'Company'}</h3>
          <div>{invoice?.partyName}</div>
          <div>{invoice?.partyGst}</div>
        </div>
        <div>
          <div><strong>Invoice:</strong> {invoice?.invoice_no}</div>
          <div><strong>Date:</strong> {invoice?.date}</div>
        </div>
      </div>
      <Table dataSource={items} columns={columns} pagination={false} rowKey={(r,i)=>i}/>
      <div style={{textAlign:'right', marginTop:12}}>
        <div>Subtotal: {currencyINR(invoice?.subtotal)}</div>
        <div>Tax: {currencyINR(invoice?.tax)}</div>
        <div style={{fontWeight:700}}>Grand Total: {currencyINR(invoice?.grand)}</div>
        <div style={{marginTop:8}}><strong>Amount in Words:</strong> {numberToWords(Math.round(invoice?.grand||0))}</div>
      </div>
    </Modal>
  );
}