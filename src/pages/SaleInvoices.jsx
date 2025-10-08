import React, { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { Card, Table, Button, Spin } from 'antd';
import { getInvoices } from '../api/mockApi';
import { currencyINR, formatDateIndian } from '../utils/format';

export default function SaleInvoices(){
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{ setLoading(true); getInvoices().then(d=>setData(d)).finally(()=>setLoading(false)); },[]);
  const columns = [
    { title:'Date', dataIndex:'date', render: d=>formatDateIndian(d) },
    { title:'Invoice no', dataIndex:'invoice_no' },
    { title:'Party Name', dataIndex:'party_name' },
    { title:'Amount', dataIndex:'total', render: a=>currencyINR(a) },
    { title:'Actions', key:'a', render: ()=> <><Button size="small">Edit</Button><Button size="small" danger style={{marginLeft:8}}>Delete</Button></> }
  ];
  return (
    <AppLayout>
      <div>
        <h2>Sale Invoices</h2>
        <Card extra={<div style={{fontWeight:700}}>{currencyINR(data.reduce((s,r)=>s+(r.total||0),0))}</div>}>
          { loading ? <Spin/> : <Table dataSource={data} columns={columns} rowKey="id" /> }
        </Card>
      </div>
    </AppLayout>
  );
}
