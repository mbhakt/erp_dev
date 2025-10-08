import React, { useState } from 'react';
import { Card, Input, Button, Table, InputNumber, Select } from 'antd';
import { currencyINR } from '../utils/format';
import { fetchItems } from '../api/mockApi';

const { Option } = Select;

export default function InvoiceEditor(){
  const [rows, setRows] = useState([{ id:null, name:'', qty:1, price:0, amount:0 }]);
  const [itemsList, setItemsList] = useState([]);
  React.useEffect(()=>{ fetchItems().then(setItemsList); },[]);
  const updateRow = (index, patch) => {
    const newRows = [...rows];
    newRows[index] = { ...newRows[index], ...patch };
    newRows[index].amount = (Number(newRows[index].qty)||0) * (Number(newRows[index].price)||0);
    setRows(newRows);
  };
  const addRow = ()=> setRows([...rows, { id:null, name:'', qty:1, price:0, amount:0 }]);
  const removeRow = (i)=> setRows(rows.filter((_,idx)=>idx!==i));
  const total = rows.reduce((s,r)=>s+(Number(r.amount)||0),0);
  const columns = [
    { title:'Item', dataIndex:'name', render: (_,r,idx) => (<Select showSearch style={{width:360}} value={r.id} onChange={val=>{ const sel=itemsList.find(i=>i.id===val); updateRow(idx,{ id:sel.id, name:sel.name, price: sel.sale_price }); }}>{itemsList.map(si=><Option key={si.id} value={si.id}>{si.name} — {si.id}</Option>)}</Select>) },
    { title:'Qty', dataIndex:'qty', render:(v,_,idx)=><InputNumber min={0} value={v} onChange={val=>updateRow(idx,{qty:val})}/> },
    { title:'Price', dataIndex:'price', render:(v,_,idx)=><InputNumber value={v} onChange={val=>updateRow(idx,{price:val})}/> },
    { title:'Amount', dataIndex:'amount', render: v=>currencyINR(v) },
    { title:'Actions', key:'a', render: (_,__,idx)=><Button danger size="small" onClick={()=>removeRow(idx)}>Delete</Button> }
  ];
  return (
    <Card title="Invoice Editor">
      <div style={{marginBottom:12}}>
        <Input placeholder="Party name" style={{width:320, marginRight:12}} />
        <Input placeholder="Invoice no" style={{width:160}} />
      </div>
      <Table dataSource={rows} columns={columns} pagination={false} rowKey={(r,i)=>i} />
      <div style={{marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div><Button type="dashed" onClick={addRow}>+ Add Row</Button></div>
        <div style={{textAlign:'right'}}><div style={{fontSize:18,fontWeight:700}}>{currencyINR(total)}</div><div style={{marginTop:8}}><Button style={{marginRight:8}}>Save</Button><Button>Cancel</Button></div></div>
      </div>
    </Card>
  );
}
